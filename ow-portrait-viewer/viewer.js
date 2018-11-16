'use strict';

var SVG = "http://www.w3.org/2000/svg";
var CIRCUMFERENCE = 100;

window.onload = function () {
    var parent = document.getElementById("portraits");
    var start_string = "0x0250000000000";
    var start = 0x918; //0x922;
    var end = 0x9d0; //0x9cd
    for (var i = start; i <= end; i++) {
        var hex_string = start_string + i.toString(16).toUpperCase();

        var div_element = document.createElement("div");
        div_element.id = hex_string;
        div_element.className = "portrait";

        var div_img_container = document.createElement("div");
        div_img_container.id = "img-container:" + hex_string;
        div_img_container.className = "img-container";

        var img_element_top = document.createElement("img");
        img_element_top.src = "https://blzgdapipro-a.akamaihd.net/game/playerlevelrewards/" + hex_string + "_Rank.png";
        img_element_top.className = "img-top";
        div_img_container.appendChild(img_element_top);

        var img_element_bottom = document.createElement("img");
        img_element_bottom.src = "https://blzgdapipro-a.akamaihd.net/game/playerlevelrewards/" + hex_string + "_Border.png";
        img_element_bottom.className = "img-bottom";
        div_img_container.appendChild(img_element_bottom);

        div_element.appendChild(div_img_container);

        var label_element = document.createElement("label");
        var text_node = document.createTextNode(hex_string);
        label_element.htmlFor = "img-container:" + hex_string;
        label_element.appendChild(text_node);
        label_element.className = "portrait-label";
        div_element.appendChild(label_element);

        parent.appendChild(div_element);
    }

    var endorsementForm = document.getElementById("endorsement-form");
    endorsementForm.onsubmit = function (e) {
        e.preventDefault();

        var level = document.getElementById("endorsement-form-level").value;
        var shotcaller = document.getElementById("endorsement-form-shotcaller").value;
        var teammate = document.getElementById("endorsement-form-teammate").value;
        var sportsmanship = document.getElementById("endorsement-form-sportsmanship").value;

        if (level && shotcaller && teammate && sportsmanship) {
            level = parseInt(level);
            var shotcallerF = parseFloat(shotcaller);
            var teammateF = parseFloat(teammate);
            var sportsmanshipF = parseFloat(sportsmanship);
            var totalF = shotcallerF + teammateF + sportsmanshipF;

            if (level && level > 0 && level <= 5 && shotcallerF >= 0 && teammateF >= 0 && sportsmanshipF >= 0 && totalF > 0) {
                var endorsementDiv = document.getElementById("endorsement");
                endorsementDiv.innerHTML = '';
                {
                    var endorsementLevelDiv = document.createElement("div");
                    endorsementLevelDiv.className = "endorsement-level";
                    {
                        var endorsementIconDiv = document.createElement("div");
                        endorsementIconDiv.style = "background-image:url(https://d3hmvhl7ru3t12.cloudfront.net/svg/icons/endorsement-frames-be58f32488898c106f2ad8b1c3012dbce42d19b758c4b18bf2afbe91fc8f1d2cc83a0de433321792ff0fb3a1f66d37ded31598bd538838b30fa4537db617926e.svg#_" + level + ")";
                        endorsementIconDiv.className = "endorsement-icon";
                        {
                            var endorsementIconInnerDiv = document.createElement("div");
                            endorsementIconInnerDiv.className = "endorsement-icon-inner";
                            {
                                var circle = document.createElementNS(SVG, "circle");
                                circle.setAttributeNS(null, "cx", "50%");
                                circle.setAttributeNS(null, "cy", "50%");
                                circle.setAttributeNS(null, "r", (CIRCUMFERENCE / (2 * Math.PI)).toString());

                                var backgroundSvg = document.createElementNS(SVG, "svg");
                                backgroundSvg.setAttributeNS(null, "class", "endorsement-background");
                                backgroundSvg.setAttributeNS(null, "viewBox", "0 0 36 36");
                                backgroundSvg.appendChild(circle.cloneNode(false));
                                endorsementIconInnerDiv.appendChild(backgroundSvg);

                                var padding = ((shotcallerF > 0 && teammateF === 0 && sportsmanshipF === 0) ||
                                    (sportsmanshipF > 0 && shotcallerF === 0 && teammateF === 0) ||
                                    (teammateF > 0 && sportsmanshipF === 0 && shotcallerF === 0)) ? 0 : 1;

                                if (shotcallerF > 0) {
                                    var shotcallerSvg = document.createElementNS(SVG, "svg");
                                    shotcallerSvg.setAttributeNS(null, "class", "endorsement-border endorsement-border-shotcaller");
                                    shotcallerSvg.setAttributeNS(null, "viewBox", "0 0 36 36");
                                    shotcallerSvg.setAttributeNS(null, "style", "stroke-dasharray: " + Math.max(0, (CIRCUMFERENCE * shotcallerF / totalF) - padding) + ", " + CIRCUMFERENCE + "; transform: rotate(360deg)");
                                    shotcallerSvg.appendChild(circle.cloneNode(false));
                                    endorsementIconInnerDiv.appendChild(shotcallerSvg);
                                }

                                if (teammateF > 0) {
                                    var teammateSvg = document.createElementNS(SVG, "svg");
                                    teammateSvg.setAttributeNS(null, "class", "endorsement-border endorsement-border-teammate");
                                    teammateSvg.setAttributeNS(null, "viewBox", "0 0 36 36");
                                    teammateSvg.setAttributeNS(null, "style", "stroke-dasharray: " + Math.max(0, (CIRCUMFERENCE * teammateF / totalF) - padding) + ", " + CIRCUMFERENCE + "; transform: rotate(" + (360 * (1 + (shotcallerF / totalF))) + "deg)");
                                    teammateSvg.appendChild(circle.cloneNode(false));
                                    endorsementIconInnerDiv.appendChild(teammateSvg);
                                }

                                if (sportsmanshipF > 0) {
                                    var sportsmanshipSvg = document.createElementNS(SVG, "svg");
                                    sportsmanshipSvg.setAttributeNS(null, "class", "endorsement-border endorsement-border-sportsmanship");
                                    sportsmanshipSvg.setAttributeNS(null, "viewBox", "0 0 36 36");
                                    sportsmanshipSvg.setAttributeNS(null, "style", "stroke-dasharray: " + Math.max(0, (CIRCUMFERENCE * sportsmanshipF / totalF) - padding) + ", " + CIRCUMFERENCE + "; transform: rotate(" + (360 * (1 + ((shotcallerF + teammateF) / totalF))) + "deg)");
                                    sportsmanshipSvg.appendChild(circle.cloneNode(false));
                                    endorsementIconInnerDiv.appendChild(sportsmanshipSvg);
                                }
                            }
                            endorsementIconDiv.appendChild(endorsementIconInnerDiv);
                        }
                        endorsementLevelDiv.appendChild(endorsementIconDiv);

                        var endorsementLevelTextDiv = document.createElement("div");
                        endorsementLevelTextDiv.className = "endorsement-level-text";
                        endorsementLevelTextDiv.innerText = level.toString();
                        endorsementLevelDiv.appendChild(endorsementLevelTextDiv);
                    }
                    endorsementDiv.appendChild(endorsementLevelDiv);
                }
            }
        }
    }
}
/*
For async loading
var image = document.images[0];
var downloadingImage = new Image();
downloadingImage.onload = function() {
  image.src = this.src;
};
downloadingImage.src = "https://blzgdapipro-a.akamaihd.net/game/playerlevelrewards/0x0250000000000922_Rank.png";
*/
