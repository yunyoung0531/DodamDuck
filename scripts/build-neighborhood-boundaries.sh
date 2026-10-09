#!/usr/bin/env bash
#
# 전국 행정동 경계 GeoJSON -> 동네 인증용 단순화 파일
#
# 동네 인증은 좌표를 브라우저 밖으로 보내지 않는다. 브라우저가 이 파일을 받아
# "현재 좌표가 어느 동 안에 있는지"를 직접 판정하고, 서버에는 행정동 코드만
# 보낸다. 위치정보법상 근거는 docs/location-verification-plan.md에 있다.
#
# 원본은 34.6MB라 그대로 내려보낼 수 없다. mapshaper로 꼭짓점을 줄이고
# 속성을 코드와 이름만 남긴다. 광주와 서울에서 무작위 점 1,500개씩을
# 원본과 비교한 결과다.
#
#   단순화    파일      gzip     원본과 같은 동 (광주 / 서울)
#   5%        1.8MB    353KB    94.7% / 91.0%
#   10%       2.6MB    547KB    96.7% / 94.2%
#   20%       4.1MB    921KB    99.1% / 98.7%   <- 채택
#
# 틀리는 점은 모두 동 경계 근처라 GPS 오차(수십 m)와 같은 수준이다.
#
# 데이터: vuski/admdongkor (통계청 SGIS 행정동 경계 보정본), CC BY 4.0.
# 화면에 "통계청 SGIS, vuski/admdongkor" 출처 표시를 남겨야 한다.
#
# 데이터 버전을 올리면 regions 테이블도 같은 파일로 다시 채운다. 이 스크립트가
# 마지막에 출력하는 seed SQL을 Supabase SQL Editor에서 실행한다. 지우지 않고
# upsert만 하는 이유는 profiles.verified_region_code가 regions를 참조하기 때문이다.
# 폐지된 동은 행으로 남지만 경계 파일에 없으므로 새로 인증될 일은 없다.
#
# 실행:
#   ./scripts/build-neighborhood-boundaries.sh

set -euo pipefail

cd "$(dirname "$0")/.."

DATA_VERSION="ver20260701"
SOURCE_URL="https://raw.githubusercontent.com/vuski/admdongkor/master/${DATA_VERSION}/HangJeongDong_${DATA_VERSION}.geojson"
OUT_FILE="public/data/hangjeongdong.json"
SEED_FILE="${TMPDIR:-/tmp}/regions-seed.sql"

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "내려받는 중: ${DATA_VERSION}"
curl -fsSL -o "$WORK_DIR/source.geojson" "$SOURCE_URL"

mkdir -p "$(dirname "$OUT_FILE")"

pnpm dlx mapshaper@0.7.80 "$WORK_DIR/source.geojson" \
  -simplify 20% keep-shapes \
  -filter-fields adm_cd2,adm_nm \
  -o "$OUT_FILE" format=geojson precision=0.00001

node -e '
const fs = require("fs");
const { features } = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const codes = new Set(features.map((f) => f.properties.adm_cd2));
if (codes.size !== features.length) throw new Error("adm_cd2 중복");
const quote = (s) => "\x27" + s.replace(/\x27/g, "\x27\x27") + "\x27";
const rows = features.map(({ properties: p }) => `(${quote(p.adm_cd2)}, ${quote(p.adm_nm)})`);
fs.writeFileSync(
  process.argv[2],
  "insert into public.regions (code, name) values\n" + rows.join(",\n") +
    "\non conflict (code) do update set name = excluded.name;\n"
);
console.log(`행정동 ${features.length}개`);
' "$OUT_FILE" "$SEED_FILE"

echo "완료: $OUT_FILE ($(du -h "$OUT_FILE" | cut -f1), gzip $(gzip -c "$OUT_FILE" | wc -c | awk '{printf "%dKB", $1/1024}'))"
echo "seed SQL: $SEED_FILE"
