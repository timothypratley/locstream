
(function (v1z) {

    var feet2meters = 0.3048,
        defaultWidth = 8,
        defaultHeight = 8.5,
        defaultLength = 20,
        lengths = {
            "1": 10,
            "2": 20,
            "3": 30,
            "4": 40,
            "B": 24,
            "C": 24.5,
            "G": 41,
            "H": 43,
            "L": 45,
            "M": 48,
            "N": 49
        },
        heights = {
            "0": 8,
            "2": 8.5,
            "4": 9,
            "5": 9.5,
            "6": 9.5,
            "8": 4.25,
            "C": 8.5,
            "D": 9,
            "E": 9.5,
            "9": 4
        },
        widths = {
            "C": 8.2,
            "D": 8.2,
            "E": 8.2,
            "F": 8.2,
            "L": 8.5,
            "M": 8.5,
            "N": 8.5,
            "P": 8.5
        },
        dimensions = {};

    function createDimensions(sizetype) {
        return {
            length: (lengths[sizetype.charAt(0)] || defaultLength) * feet2meters,
            height: (heights[sizetype.charAt(1)] || defaultHeight) * feet2meters,
            width: (widths[sizetype.charAt(1)] || defaultWidth) * feet2meters
        };
    }
    function getDimensions(sizetype) {
        return dimensions[sizetype]
            || (dimensions[sizetype] = createDimensions(sizetype));
    }

    v1z.sizetype = {
        getDimensions: getDimensions
    };

} (window.v1z = window.v1z || {}));
