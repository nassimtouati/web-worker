
export class Mobile {
    id: string;
    px: number;
    py: number;
    lng: number;
    lat: number;

    constructor(id: string, px: number, py: number) {
        this.id = id;
        this.px = px;
        this.py = py;
    }

    info() {
        console.log('id=' +  this.id);
    }

// class
}