/*
  V0.3
*/

/*
  Storage - localforage
  https://localforage.github.io/localForage/

DB.Forces = localforage.createInstance({
  name: "Forces"
});

*/
import "../lib/localforage.min.js"
const DB = {}
DB.Pools = localforage.createInstance({
  name: "Pools"
});

/*
  Chance RNG
*/
import "../lib/chance.min.js"
import {BuildArray, SpliceOrPush} from "./random.js"

/*
  UI Resources  
*/
//Preact
import {h, Component, render} from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
// Initialize htm with Preact
const html = htm.bind(h);

/*
  App Sub UI
*/
import {DicePool} from './dicePool.js';
import*as UI from './UI.js';

/*
  Colors 
*/
const Colors = ["aquamarine","beige","blue","chartreuse","coral","cyan","fuchsia","gold","hotpink","indigo","magenta","olive","orange","pink","red","salmon","teal","violet","yellow"]

/*
  Game
*/
const Game = {} 

/*
  Declare the main App 
*/

class App extends Component {
  constructor() {
    super();
    this.state = {
      show: "Roll",
      reveal: [],
      dialog: "",
      //for UI selection 
      selection : "",
      selected: "",
      //dice basics 
      dice : [4,6,8,10,12],
      //
      newPool : null,
      activePools : [],
      //rolling dice 
      toRoll : {}
    };

    //use in other views 
    this.html = html
    this.game = Game
    this.db = DB 

    this.DicePool = DicePool
    this.Pools = {}
  }

  // Lifecycle: Called whenever our component is created
  async componentDidMount() {
    DB.Pools.iterate((value, key, iterationNumber) => {
      this.Pools[key] = DicePool.load(this,key,value)
    })
      .then(() => this.refresh())
  }

  // Lifecycle: Called just before our component will be destroyed
  componentWillUnmount() {}

  /*
    Render functions 
  */

  notify(text, type="success") {
    let opts = {
      theme: "relax",
      type,
      text,
      layout: "center"
    }

    new Noty(opts).show();
  }

  //main function for updating state 
  async updateState(what, val) {
    let s = {}
    s[what] = val
    await this.setState(s)

    if (this.map) {
      this.map.draw()
    }
  }

  //main functions for setting view - usine set/get of show 

  refresh() {
    this.show = this.state.show
    this.dialog = this.state.dialog
  }

  set show(what) {
    this.updateState("show", what)
  }

  get show() {
    let[what,id] = this.state.show.split(".")
    return UI[what] ? UI[what](this) : this[what] ? this[what][id].UI ? this[what][id].UI() : "" : ""
  }

  set dialog(what) {
    this.state.newData = undefined 
    this.state.selected = ""
    this.updateState("dialog", what)
  }

  get dialog() {
    let[what,id] = this.state.dialog.split(".")
    return what == "" ? "" : UI.Dialog(this)
  }

  //clears current UI 
  cancel () {
    this.state.activePools = []
    this.state.toRoll = {}
    this.show = "Roll"
    this.dialog = ""
  }

  /*
    Game Data Get Fiunctions  
  */

  /*
    Save / Load 
  */
  async save () {
  }

  async load () {
  }

  async delete () {
  }

  /*
    Game Functions 
  */

  makePool () {
    this.state.activePools.push(new DicePool(this)) 
  }

  roll () {
    Object.values(this.state.toRoll).forEach(pool => {
      let allDice = pool.map(p => p[1]).flat()
      let res = allDice.map(d=> chance["d"+d]())
      pool.roll = {
        d : allDice,
        res 
      }
    })

    this.refresh()
  }

  /*
    Render 
  */

  //main page render 
  render({}, {show,active,selected}) {
    //final layout 
    return html`
    <div class="relative flex flex-wrap items-center justify-between ph3 z-2">
      <div>
        <h1 class="pointer underline-hover mv1" onClick=${()=>this.cancel()}>Dice Pool Assistant</h1>
      </div>
      <div class="flex items-center">
        <div class="b tc pointer dim underline-hover hover-white hover-bg-green db ba br2 ma1 pa2 hidden" onClick=${()=> true}>Add Force</div>
      </div>
    </div>
    <div class="absolute z-1 w-100 pa2">
      ${this.show}
    </div>
    ${this.dialog}
    `
  }
}

render(html`<${App}/>`, document.getElementById("app"));



