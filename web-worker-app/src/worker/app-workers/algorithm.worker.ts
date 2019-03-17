import { WorkerMessage } from './shared/worker-message.model';
import { Mobile } from './shared/mobile.model';
import { Label } from './shared/label.model';
import { Anchor } from './shared/anchor.model';

export class AlgorithmWorker {

    public static lab = [];
    public static anc = [];
    public static w = 1; // box width
    public static h = 1; // box width

    public static max_move = 5.0;
    public static max_angle = 0.5;
    public static acc = 0;
    public static rej = 0;

    // weights
    public static w_len = 0.2; // leader line length 
    public static w_inter = 1.0; // leader line intersection
    public static w_lab2 = 30.0; // label-label overlap
    public static w_lab_anc = 30.0; // label-anchor overlap
    public static w_orient = 3.0; // orientation bias

    // booleans for user defined functions
    public static user_energy = false;
    public static user_schedule = false;

    public static user_defined_energy;
    public static user_defined_schedule;
    public static svg_w;
    public static svg_h;
    public static anchor_array;
    public static label_array;
    public static dataResponse = [];

    public static doWork(value: WorkerMessage): WorkerMessage {

        this.anchor_array = value.data[1][0];
        this.label_array = value.data[1][1];

        this.svg_w = value.data[0][0];
        this.svg_h = value.data[0][1];

        this.labeler();

        this.dataResponse.push(this.anchor_array);
        this.dataResponse.push(this.label_array);


        return new WorkerMessage(value.topic, this.dataResponse);


    }

    public static labeler() {

        this.label(this.label_array);
        this.anchor(this.anchor_array);
        this.width(this.svg_w);
        this.height(this.svg_h);
        this.start(1500);


    }

    public static energy(index) {

        // energy function, tailored for label placement

        var m = this.lab.length,
            ener = 0,
            dx = this.lab[index].x - this.anc[index].x,
            dy = this.anc[index].y - this.lab[index].y,
            dist = Math.sqrt(dx * dx + dy * dy),
            overlap = true,
            amount = 0,
            theta = 0;

        // penalty for length of leader line
        if (dist > 0) ener += dist * this.w_len;

        // label orientation bias
        dx /= dist;
        dy /= dist;
        if (dx > 0 && dy > 0) { ener += 0 * this.w_orient; }
        else if (dx < 0 && dy > 0) { ener += 1 * this.w_orient; }
        else if (dx < 0 && dy < 0) { ener += 2 * this.w_orient; }
        else { ener += 3 * this.w_orient; }

        var x21 = this.lab[index].x,
            y21 = this.lab[index].y - this.lab[index].height + 2.0,
            x22 = this.lab[index].x + this.lab[index].width,
            y22 = this.lab[index].y + 2.0;
        var x11, x12, y11, y12, x_overlap, y_overlap, overlap_area;

        for (var i = 0; i < m; i++) {
            if (i != index) {

                // penalty for intersection of leader lines
                overlap = this.intersect(this.anc[index].x, this.lab[index].x, this.anc[i].x, this.lab[i].x,
                    this.anc[index].y, this.lab[index].y, this.anc[i].y, this.lab[i].y);
                if (overlap) ener += this.w_inter;

                // penalty for label-label overlap
                x11 = this.lab[i].x;
                y11 = this.lab[i].y - this.lab[i].height + 2.0;
                x12 = this.lab[i].x + this.lab[i].width;
                y12 = this.lab[i].y + 2.0;
                x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
                y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
                overlap_area = x_overlap * y_overlap;
                ener += (overlap_area * this.w_lab2);
            }

            // penalty for label-anchor overlap
            x11 = this.anc[i].x - this.anc[i].r;
            y11 = this.anc[i].y - this.anc[i].r;
            x12 = this.anc[i].x + this.anc[i].r;
            y12 = this.anc[i].y + this.anc[i].r;
            x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
            y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
            overlap_area = x_overlap * y_overlap;
            ener += (overlap_area * this.w_lab_anc);

        }
        return ener;
    }

    public static mcmove(currT) {
        // Monte Carlo translation move

        // select a random label
        var i = Math.floor(Math.random() * this.lab.length);

        // save old coordinates
        var x_old = this.lab[i].x;
        var y_old = this.lab[i].y;

        // old energy
        var old_energy;
        if (this.user_energy) { old_energy = this.user_defined_energy(i, this.lab, this.anc) }
        else { old_energy = this.energy(i) }

        // random translation
        this.lab[i].x += (Math.random() - 0.5) * this.max_move;
        this.lab[i].y += (Math.random() - 0.5) * this.max_move;

        // hard wall boundaries
        // if (this.lab[i].x > this.w) this.lab[i].x = x_old;
        // if (this.lab[i].x < 0) this.lab[i].x = x_old;
        // if (this.lab[i].y > this.h) this.lab[i].y = y_old;
        // if (this.lab[i].y < 0) this.lab[i].y = y_old;

        // new energy
        var new_energy;
        if (this.user_energy) { new_energy = this.user_defined_energy(i, this.lab, this.anc) }
        else { new_energy = this.energy(i) }

        // delta E
        var delta_energy = new_energy - old_energy;

        if (Math.random() < Math.exp(-delta_energy / currT)) {
            this.acc += 1;
        } else {
            // move back to old coordinates
            this.lab[i].x = x_old;
            this.lab[i].y = y_old;
            this.rej += 1;
        }

    }

    public static mcrotate(currT) {
        // Monte Carlo rotation move

        // select a random label
        var i = Math.floor(Math.random() * this.lab.length);

        // save old coordinates
        var x_old = this.lab[i].x;
        var y_old = this.lab[i].y;

        // old energy
        var old_energy;
        if (this.user_energy) { old_energy = this.user_defined_energy(i, this.lab, this.anc) }
        else { old_energy = this.energy(i) }

        // random angle
        var angle = (Math.random() - 0.5) * this.max_angle;

        var s = Math.sin(angle);
        var c = Math.cos(angle);

        // translate label (relative to anchor at origin):
        this.lab[i].x -= this.anc[i].x
        this.lab[i].y -= this.anc[i].y

        // rotate label
        var x_new = this.lab[i].x * c - this.lab[i].y * s,
            y_new = this.lab[i].x * s + this.lab[i].y * c;

        // translate label back
        this.lab[i].x = x_new + this.anc[i].x
        this.lab[i].y = y_new + this.anc[i].y

        // hard wall boundaries
        if (this.lab[i].x > this.w) this.lab[i].x = x_old;
        if (this.lab[i].x < 0) this.lab[i].x = x_old;
        if (this.lab[i].y > this.h) this.lab[i].y = y_old;
        if (this.lab[i].y < 0) this.lab[i].y = y_old;

        // new energy
        var new_energy;
        if (this.user_energy) { new_energy = this.user_defined_energy(i, this.lab, this.anc) }
        else { new_energy = this.energy(i) }

        // delta E
        var delta_energy = new_energy - old_energy;

        if (Math.random() < Math.exp(-delta_energy / currT)) {
            this.acc += 1;
        } else {
            // move back to old coordinates
            this.lab[i].x = x_old;
            this.lab[i].y = y_old;
            this.rej += 1;
        }

    };

    public static intersect(x1, x2, x3, x4, y1, y2, y3, y4) {
        // returns true if two lines intersect, else false
        // from http://paulbourke.net/geometry/lineline2d/

        var mua, mub;
        var denom, numera, numerb;

        denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
        numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

        /* Is the intersection along the the segments */
        mua = numera / denom;
        mub = numerb / denom;
        if (!(mua < 0 || mua > 1 || mub < 0 || mub > 1)) {
            return true;
        }
        return false;
    }

    public static cooling_schedule(currT, initialT, nsweeps) {
        // linear cooling
        return (currT - (initialT / nsweeps));
    }

    public static start(nsweeps) {
        // main simulated annealing function
        var m = this.lab.length,
            currT = 1.0,
            initialT = 1.0;

        for (var i = 0; i < nsweeps; i++) {
            for (var j = 0; j < m; j++) {
                if (Math.random() < 0.5) { this.mcmove(currT); }
                else { this.mcrotate(currT); }
            }
            currT = this.cooling_schedule(currT, initialT, nsweeps);
        }

        // PBE global variables alteration
    };

    public static width(x) {
        // users insert graph width
        if (!arguments.length) return this.w;
        this.w = x;
        return this.labeler;
    };

    public static height(x) {
        // users insert graph height
        if (!arguments.length) return this.h;
        this.h = x;
        return this.labeler;
    };

    public static label(x) {
        // users insert label positions
        if (!arguments.length) return this.lab;
        this.lab = x;

        return this.labeler;
    };

    public static anchor(x) {
        // users insert anchor positions
        if (!arguments.length) return this.anc;
        this.anc = x;
        return this.labeler;
    };



}
