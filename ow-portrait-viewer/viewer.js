'use strict';

const SVG = "http://www.w3.org/2000/svg";
const CIRCUMFERENCE = 100;
const BORDER_TYPES = ["bronze", "silver", "gold", "platinum", "diamond"];

$(function () {
    const parent = $("#portrait-viewer");

    for (let border_type_index = 0; border_type_index < BORDER_TYPES.length; border_type_index++) {
        for (let stars_index = 0; stars_index <= 5; stars_index++) {
            for (let border_index = 0; border_index <= 9; border_index++) {
                const level = 600 * border_type_index + 100 * stars_index + 10 * border_index + 1;
                const div_element = $("<div>", {
                    "class": "portrait-box"
                });
                {
                    const div_img_container = $("<div>", {
                        id: "img-container:" + level,
                        class: "img-container"
                    })
                    {
                        if (stars_index > 0) {
                            $("<img>", {
                                class: "img-top",
                                src: "img/portraits/" + BORDER_TYPES[border_type_index] + "/stars_" + stars_index + ".png"
                            }).appendTo(div_img_container);
                        }

                        $("<img>", {
                            class: "img-bottom",
                            src: "img/portraits/" + BORDER_TYPES[border_type_index] + "/border_" + border_index + ".png"
                        }).appendTo(div_img_container);

                        /*$("<div>", {
                            class: "img-level-text"
                        }).text(level).appendTo(div_img_container);*/
                    }
                    div_element.append(div_img_container);

                    $("<label>", {
                        class: "portrait-label",
                        for: "img-container:" + level
                    }).text(level + " - " + (level + 9)).appendTo(div_element);
                }
                parent.append(div_element);
            }
        }
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
        if (isNaN(level) || level <= 0 || level > 3000) {
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
    return BORDER_TYPES[Math.floor((level - 1) / 600)];
}

function getBorderIndex(level) {
    return Math.floor(((level - 1) % 100) / 10);
}

function getStarsIndex(level) {
    if (level > 2900) {
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
