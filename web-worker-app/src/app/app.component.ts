import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { WorkerService } from './worker.service';
import { WorkerMessage } from 'src/worker/app-workers/shared/worker-message.model';
import { WORKER_TOPIC } from '../worker/app-workers/shared/worker-topic.constants';
import { Mobile } from '../worker/app-workers/shared/mobile.model';
import { Label } from '../worker/app-workers/shared/label.model';
import { Anchor } from '../worker/app-workers/shared/anchor.model';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'webworker-in-angular6';
  iterations = 0;
  workerTopic = WORKER_TOPIC.cpuIntensive;
  workerServiceSubscription: Subscription;


  public svg_w = 1333;
  public svg_h = 800;


  public nb_mobiles = 200;
  public mobile_radius = 10;
  public mp_mobiles: Map<string, Mobile> = new Map();

  public mobiles;
  public anchor_array;
  public label_array;
  public args = [];
  public data = [];
  public block = [];

  constructor(private workerService: WorkerService) { }

  ngOnInit() {
    this.listenForWorkerResponse();
  }

  ngOnDestroy(): void {
    if (this.workerServiceSubscription) {
      this.workerServiceSubscription.unsubscribe();
    }
  }

  processInComponent() {
    this.iterations = this.cpuIntensiveCalc(3000).iteration;
  }

  // Sending message to the worker
  processInWorker() {
    this.iterations = 0;

    this.generateMobiles(this.nb_mobiles);
    this.mobiles = Array.from(this.mp_mobiles.values());

    this.anchor_array = this.convert_ar_mobile_to_ar_anchor(this.mobiles);
    this.label_array = this.generate_ar_label_from_ar_mobile(this.mobiles);

    this.args.push(this.svg_w);
    this.args.push(this.svg_h);
    this.data.push(this.anchor_array);
    this.data.push(this.label_array);
    this.block.push(this.args);
    this.block.push(this.data);
    const workerMessage = new WorkerMessage(this.workerTopic, this.block);
    this.workerService.doWork(workerMessage);
  }

  private cpuIntensiveCalc(duration: number) {
    const before = new Date();
    let count = 0;
    while (true) {
      count++;
      const now = new Date();
      if (now.valueOf() - before.valueOf() > duration) {
        break;
      }
    }
    return { iteration: count };
  }

  private listenForWorkerResponse() {
    this.workerServiceSubscription = this.workerService.workerUpdate$
      .subscribe(data => {
        return this.workerResponseParser(data)
      });


  }

  private workerResponseParser(message: WorkerMessage) {
    if (message.topic === this.workerTopic) {
      this.iterations = 0;
    }
  }

  // convert mobiles to anchors
  public convert_ar_mobile_to_ar_anchor(tmp_ar: Mobile[]): Anchor[] {
    let m: Mobile;
    let a: Anchor;
    const ar_anc: Anchor[] = new Array();

    for (m of tmp_ar) {
      a = new Anchor(m.px, m.py, this.mobile_radius);
      ar_anc.push(a);
    }
    return ar_anc;
  }

  // generate labels from mobiles
  public generate_ar_label_from_ar_mobile(tmp_ar: Mobile[]): Label[] {
    let m: Mobile;
    let l: Label;
    const ar_label: Label[] = new Array();

    for (m of tmp_ar) {
      l = new Label(m.px, m.py, 52, 20, m.id);
      ar_label.push(l);
    }

    return ar_label;
  }

  public generateMobiles(max_mobiles: number) {
    const rnd_max_x = Math.floor(this.svg_w / this.mobile_radius);
    const rnd_max_y = Math.floor(this.svg_h / this.mobile_radius);
    // console.log('rnd_max_x=' + rnd_max_x + ' - rnd_max_y=' + rnd_max_y);
    for (let i = 0; i < max_mobiles; i++) {
      let px = Math.floor(Math.random() * rnd_max_x) * this.mobile_radius;
      if (px <= 0) { px = this.mobile_radius; }
      let py = Math.floor(Math.random() * rnd_max_y) * this.mobile_radius;
      if (py <= 0) { py = this.mobile_radius; }
      const str = '' + i;
      const m = new Mobile(str.padStart(4, '0'), px, py);
      this.mp_mobiles.set(m.id, m);
    }
  }
}