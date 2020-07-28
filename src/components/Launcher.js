import React from 'react';
import { IMAGES } from "../constants";

function Launcher(props) {
  const { onClick } = props;

  return (
  	<div id="ch_launcher" className="ch-launcher" onClick={onClick}>
	  <img id="ch_launcher_image" className="ch-launcher-image" src={IMAGES.LAUNCHER_ICON} alt="" />
  	</div>
  );
}

export { Launcher };