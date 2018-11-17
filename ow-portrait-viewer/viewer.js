'use strict';

const SVG = "http://www.w3.org/2000/svg";
const CIRCUMFERENCE = 100;

$(function () {
    const parent = $("#portrait-viewer");
    const start_string = "0x0250000000000";
    const start = 0x918; //0x922;
    const end = 0x9d0; //0x9cd
    for (let i = start; i <= end; i++) {
        const hex_string = start_string + i.toString(16).toUpperCase();

        const div_element = $("<div>", {
            "id": hex_string,
            "class": "portrait-box"
        });
        {
            const div_img_container = $("<div>", {
                id: "img-container:" + hex_string,
                class: "img-container"
            });
            {
                $("<img>", {
                    class: "img-top",
                    src: "https://blzgdapipro-a.akamaihd.net/game/playerlevelrewards/" + hex_string + "_Rank.png"
                }).appendTo(div_img_container);

                $("<img>", {
                    class: "img-bottom",
                    src: "https://blzgdapipro-a.akamaihd.net/game/playerlevelrewards/" + hex_string + "_Border.png"
                }).appendTo(div_img_container);
            }
            div_element.append(div_img_container);

            $("<label>", {
                class: "portrait-label",
                for: "img-container:" + hex_string
            }).text(hex_string).appendTo(div_element);
        }
        parent.append(div_element);
    }

    const endorsementForm = $("#endorsement-form");
    endorsementForm.submit(function (e) {
        e.preventDefault();

        let level = $("#endorsement-form-level").val();
        const shotcaller = $("#endorsement-form-shotcaller").val();
        const teammate = $("#endorsement-form-teammate").val();
        const sportsmanship = $("#endorsement-form-sportsmanship").val();

        if (level && shotcaller && teammate && sportsmanship) {
            level = parseInt(level);
            const shotcallerF = parseFloat(shotcaller);
            const teammateF = parseFloat(teammate);
            const sportsmanshipF = parseFloat(sportsmanship);
            const totalF = shotcallerF + teammateF + sportsmanshipF;

            if (level && level > 0 && level <= 5 && shotcallerF >= 0 && teammateF >= 0 && sportsmanshipF >= 0 && totalF > 0) {
                const endorsementDiv = $("#endorsement");
                endorsementDiv.empty();
                {
                    const endorsementLevelDiv = $("<div>", {
                        class: "endorsement-level"
                    });
                    {
                        const endorsementIconDiv = $("<div>", {
                            class: "endorsement-icon",
                            style: "background-image: url(https://d3hmvhl7ru3t12.cloudfront.net/svg/icons/endorsement-frames-be58f32488898c106f2ad8b1c3012dbce42d19b758c4b18bf2afbe91fc8f1d2cc83a0de433321792ff0fb3a1f66d37ded31598bd538838b30fa4537db617926e.svg#_" + level + ")"
                        });
                        {
                            const endorsementIconInnerDiv = $("<div>", {
                                class: "endorsement-icon-inner"
                            });
                            {
                                const circle = $(document.createElementNS(SVG, "circle")).attr({
                                    cx: "50%",
                                    cy: "50%",
                                    r: CIRCUMFERENCE / (2 * Math.PI)
                                });

                                $(document.createElementNS(SVG, "svg")).attr({
                                    class: "endorsement-background",
                                    viewBox: "0 0 36 36"
                                }).append(circle.clone()).appendTo(endorsementIconInnerDiv);

                                const padding = ((shotcallerF > 0 && teammateF === 0 && sportsmanshipF === 0) ||
                                    (sportsmanshipF > 0 && shotcallerF === 0 && teammateF === 0) ||
                                    (teammateF > 0 && sportsmanshipF === 0 && shotcallerF === 0)) ? 0 : 1;

                                if (shotcallerF > 0) {
                                    $(document.createElementNS(SVG, "svg")).attr({
                                        class: "endorsement-border endorsement-border-shotcaller",
                                        viewBox: "0 0 36 36",
                                        style: "stroke-dasharray: " + Math.max(0, (CIRCUMFERENCE * shotcallerF / totalF) - padding) + ", " + CIRCUMFERENCE + "; transform: rotate(360deg)"
                                    }).append(circle.clone()).appendTo(endorsementIconInnerDiv);
                                }

                                if (teammateF > 0) {
                                    $(document.createElementNS(SVG, "svg")).attr({
                                        class: "endorsement-border endorsement-border-teammate",
                                        viewBox: "0 0 36 36",
                                        style: "stroke-dasharray: " + Math.max(0, (CIRCUMFERENCE * teammateF / totalF) - padding) + ", " + CIRCUMFERENCE + "; transform: rotate(" + (360 * (1 + (shotcallerF / totalF))) + "deg)"
                                    }).append(circle.clone()).appendTo(endorsementIconInnerDiv);
                                }

                                if (sportsmanshipF > 0) {
                                    $(document.createElementNS(SVG, "svg")).attr({
                                        class: "endorsement-border endorsement-border-sportsmanship",
                                        viewBox: "0 0 36 36",
                                        style: "stroke-dasharray: " + Math.max(0, (CIRCUMFERENCE * sportsmanshipF / totalF) - padding) + ", " + CIRCUMFERENCE + "; transform: rotate(" + (360 * (1 + ((shotcallerF + teammateF) / totalF))) + "deg)"
                                    }).append(circle.clone()).appendTo(endorsementIconInnerDiv);
                                }
                            }
                            endorsementIconDiv.append(endorsementIconInnerDiv);
                        }
                        endorsementLevelDiv.append(endorsementIconDiv);

                        $("<div>", {
                            class: "endorsement-level-text"
                        }).text(level).appendTo(endorsementLevelDiv);
                    }
                    endorsementDiv.append(endorsementLevelDiv);
                }
            }
        }
    });

    const portraitForm = $("#portrait-form");
    portraitForm.submit(function (e) {
        const level = parseInt($("#portrait-form-level").val());
        if (isNaN(level)) {
            return false;
        }

        e.preventDefault();
        const border_type = getBorderType(level);
        const border_index = getBorderIndex(level);
        const stars_index = getStarsIndex(level);
        const level_text = getLevelText(level);

        const portraitDiv = $("#portrait");
        portraitDiv.empty();

        const div_parent = $("<div>", {
            class: "portrait-parent"
        });
        {
            const div_border = $("<div>", {
                class: "portrait-border",
                style: "background-image: url(img/portraits/" + border_type + "/border_" + border_index + ".png)"
            });
            {
                $("<div>", {
                    class: "portrait-level-text"
                }).text(level_text).appendTo(div_border);

                if (stars_index > 0) {
                    $("<div>", {
                        class: "portrait-stars",
                        style: "background-image: url(img/portraits/" + border_type + "/stars_" + stars_index + ".png)"
                    }).appendTo(div_border);
                }
            }
            div_parent.append(div_border);
        }
        portraitDiv.append(div_parent);
    });
});

function getBorderType(level) {
    const border_type = (level - 1) / 600;
    if (border_type < 1) {
        return "bronze";
    } else if (border_type < 2) {
        return "silver";
    } else if (border_type < 3) {
        return "gold";
    } else if (border_type < 4) {
        return "platinum";
    }
    return "diamond";
}

function getBorderIndex(level) {
    return Math.floor(((level - 1) % 100) / 10);
}

function getStarsIndex(level) {
    if (level > 5900) {
        return 5;
    }
    return Math.floor(((level - 1) % 600) / 100);
}

function getLevelText(level) {
    return ((level - 1) % 100) + 1;
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
