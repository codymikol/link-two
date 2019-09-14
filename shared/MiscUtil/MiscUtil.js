//TODO: This is just a grab bag of random stuff that should eventually be better organized...

export default class MiscUtil {

    static getStatusVals(winStatus) {
        switch (winStatus) {
            case 'TIE':
                return {color: '#cd7f32', text: 'LINK TIE'};
            case 'WINNER':
                return {color: 'gold', text: 'VICTORY'};
            default:
                return {color: 'red', text: 'TERMINATED'};
        }
    }

    static mouseInBounds(x, y, height, width, mouseX, mouseY) {
        return mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height;
    }

}