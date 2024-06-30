import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import 안드로이드손 from "./img/안드로이드_손.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGooglePlay } from "@fortawesome/free-brands-svg-icons";
import 도담덕캐릭터 from "./img/도담덕캐릭텨(누끼).png";

interface Main4Props {
  className?: string;
}

const Main4: React.FC<Main4Props> = ({ className }) => {
  return (
    <div
      className={`main1-container app-main4 main-section ${className || ""}`}
    >
      <div className="main4-large-container">
        <div>
          <p className="main4-txt">우리나라 최초 장난감 교환 플랫폼</p>
        </div>
        <div>
          <h1 className="main4-dodamduck-txt">도담덕</h1>
        </div>
        <img
          src={안드로이드손}
          width="233"
          height="233"
          className="d-inline-block align-top main4-hand-img"
          alt="안드로이드 손"
        />
        <div className="main4-google-container">
          <p className="google-play">
            <FontAwesomeIcon
              icon={faGooglePlay}
              style={{ color: "#000000", marginRight: "4px" }}
            />
            Google Play
          </p>
        </div>
        <img
          src={도담덕캐릭터}
          width="150"
          height="150"
          className="d-inline-block align-top main4-dodamduck-img"
          alt="도담덕 캐릭터"
        />
      </div>
    </div>
  );
};

export default Main4;
