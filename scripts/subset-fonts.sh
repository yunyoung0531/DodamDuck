#!/usr/bin/env bash
#
# 210 옴니고딕 OTF -> 서브셋 WOFF2 변환
#
# 원본 OTF는 하나에 2.3MB(전송 시 brotli 압축 후에도 1.45MB)라 첫 렌더에서
# FOUT이 눈에 띄게 길었다. WOFF2로 변환하면 한글 11,172자를 전부 담고도
# 200KB 수준으로 줄어든다.
#
# 여기서 한 번 더 쪼갠다. 한글 11,172자를 한 덩어리로 두면 "똠" 한 글자 때문에
# 첫 화면에서 200KB를 통째로 받아야 한다. KS X 1001 상용 2,350자와 나머지
# 8,822자를 별도 파일로 나누면, 첫 화면이 기다리는 양이 절반 아래로 떨어진다.
#
#   폰트당    상용(2,350자)   확장(8,822자)
#   035          89 KB          131 KB
#   045          95 KB          147 KB
#   ---------------------------------------
#   첫 화면      184 KB         (필요할 때만)
#
# 확장 파일은 font-family 스택에서 상용 파일 뒤에 놓인다. 브라우저는 상용
# 파일에 없는 글자를 만났을 때만 확장 파일을 받으므로, 표외 음절을 버리지
# 않으면서도 첫 화면 비용은 상용분만 낸다.
#
# 사전 준비:
#   pip install fonttools brotli
#
# 실행:
#   ./scripts/subset-fonts.sh

set -euo pipefail

cd "$(dirname "$0")/.."

# 산출물은 public/ 이 아니라 src/ 에 둔다. next/font/local 이 처리하면
# 파일명에 콘텐츠 해시가 붙어 _next/static/media 로 나가고, immutable 캐시
# 헤더를 받는다. public/ 에 두면 그 혜택이 없다.
SRC_DIR="assets/fonts"
OUT_DIR="src/fonts"

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

# 한글 외 공통 영역. 상용 파일에만 넣는다.
#   3131-318E  호환용 자모 — "ㅋㅋㅋ", "ㅠㅠ" 같은 자모 단독 표기에 필요
#   1100-11FF  첫가끝 자모 — macOS가 만드는 NFD 정규화 문자열 대비
#   2010-205E  일반 문장부호 — …, –, —, 따옴표, •
COMMON_RANGES="U+0020-007E,U+00A0-00FF,U+00B7,U+2010-2027,U+2030-205E,U+20A9,U+2190-2193,U+3000-303F,U+3131-318E,U+1100-11FF,U+FF01-FF5E,U+FFE6"

# 한글 음절을 KS X 1001 수록분과 나머지로 가른다.
# euc-kr 은 KS X 1001 수록 음절만 2바이트로 인코딩하고, 표외 음절은 8바이트
# 조합형으로 풀어쓴다. 그 길이 차이가 곧 수록 여부다.
python3 - "$WORK_DIR" <<'PYTHON'
import sys
from pathlib import Path

work = Path(sys.argv[1])
HANGUL_SYLLABLES = range(0xAC00, 0xD7A4)

in_ks_x_1001 = [c for c in HANGUL_SYLLABLES if len(chr(c).encode("euc_kr")) == 2]
beyond_ks_x_1001 = [c for c in HANGUL_SYLLABLES if c not in set(in_ks_x_1001)]

for name, codepoints in (("hangul-common", in_ks_x_1001), ("hangul-ext", beyond_ks_x_1001)):
    (work / f"{name}.txt").write_text("\n".join(f"U+{c:04X}" for c in codepoints))
    print(f"{name}: {len(codepoints)}자", file=sys.stderr)
PYTHON

subset() {
  local src="$1" out="$2"
  shift 2

  if [[ ! -f "$src" ]]; then
    echo "원본 폰트를 찾을 수 없습니다: $src" >&2
    exit 1
  fi

  pyftsubset "$src" \
    "$@" \
    --layout-features='kern,liga,calt' \
    --flavor=woff2 \
    --output-file="$out"

  awk -v name="$(basename "$out")" -v a="$(wc -c <"$src")" -v b="$(wc -c <"$out")" \
    'BEGIN { printf "%-28s %8.1f KB -> %7.1f KB  (-%d%%)\n", name, a/1024, b/1024, (1 - b/a) * 100 }'
}

mkdir -p "$OUT_DIR"

for weight in 035 045; do
  src="$SRC_DIR/210 옴니고딕OTF $weight.otf"

  subset "$src" "$OUT_DIR/omni-gothic-$weight.woff2" \
    --unicodes="$COMMON_RANGES" \
    --unicodes-file="$WORK_DIR/hangul-common.txt"

  subset "$src" "$OUT_DIR/omni-gothic-$weight-ext.woff2" \
    --unicodes-file="$WORK_DIR/hangul-ext.txt"
done

echo
ls -la "$OUT_DIR"/*.woff2
