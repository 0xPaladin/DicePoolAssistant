class DicePool {
  constructor(app, id=chance.hash()) {
    this.app = app
    this.id = id

    this.name = "Dice Pool Name"
    this.info = ""

    /*
      Dice Set 
      .name
      .dice 

      SetDice
      .name
      .dice 
    */
    this.sets = []
  }
  addSet() {
    let ns = {
      name: "Set Name",
      dice: [{
        name: "Die Info",
        dice: [6]
      }]
    }

    this.sets.push(ns)
    this.app.refresh()
  }
  addDie(i,d = 6) {
    let nd = {
      name: "Die Info",
      dice: [d]
    }
    i == -1 ? this.temp.push(nd) : this.sets[i].dice.push(nd)
    this.app.refresh()
  }
  clone () {
    let state = JSON.parse(JSON.stringify(this.state))
    let P = DicePool.load(this.app, chance.hash(), state)
    this.app.state.activePools.push(P)
    this.app.refresh()
  }
  get state() {
    return {
      name: this.name,
      info: this.info,
      sets: this.sets,
    }
  }
  async save(id = this.id) {
    let DB = this.app.db.Pools

    let data = this.state

    await DB.setItem(id, data)

    this.app.Pools[id] = this
    this.app.refresh()
  }
  static load(app, id, data) {
    let P = new DicePool(app,id)
    Object.keys(data).forEach(k => P[k] = data[k])

    return P
  }
  UI() {
    const {html, state} = this.app
    const {toRoll, activePools} = state
    const activeIDs = activePools.map(p => p.active)
    const i = activeIDs.indexOf(this.active)

    const modDice = (name,dice) => {
      let tr = toRoll[this.id] || []
      tr.name = this.name 
      tr.push([name,dice])
      toRoll[this.id] = tr 
    }

    return html`
    <div class="ba ma1 pa1">
      <div class="flex items-center justify-between">
        <h3 class="mv1 w-100"><input class="w-100" value=${this.name} onChange=${(e)=> this.name = e.target.value}></input></h3>
        <div class="flex mh1">
          <div class="pointer white b bg-green br1 mh1 pa1" onClick=${()=>this.app.refresh(this.addSet())}>+Set</div>
          <div class="pointer white b bg-red br1 pa1" onClick=${()=>this.app.refresh(state.activePools.splice(i,1))}>✗</div>
        </div>
      </div>
      <div><textarea rows="4" cols="50" value=${this.info} onChange=${(e)=> this.info = e.target.value}></textarea></div>
      <div class="flex flex-column">
        ${this.sets.map((dSet,j) => html`
        <div class="ba ma1 pa1">
          <div class="flex items-center justify-between mv1">
            <h4 class="mv0 w-100"><input class="w-100" value=${dSet.name} onChange=${(e)=> dSet.name = e.target.value}></input></h4>
            <div class="pointer white b bg-green br1 mh1 pa1" onClick=${()=>this.app.refresh(this.addDie(j))}>+Die</div>
            <div class="pointer white b bg-red br1 pa1" onClick=${()=>this.app.refresh(this.sets.splice(j,1))}>✗</div>
          </div>
          ${dSet.dice.map((dice,k) => html`
            <div class="flex items-center justify-between">
              <input value=${dice.name} onChange=${(e)=> dice.name = e.target.value}></input>
              ${DieDropdown(this.app,dice.dice)}
              <div class="pointer white b bg-green br2 pa1" onClick=${()=>this.app.refresh(dice.dice.push(6))}>+1</div>
              <div class="pointer link dim underline-hover white b bg-light-blue br1 mh1 pa1" onClick=${()=> this.app.refresh(modDice(dSet.name+": "+dice.name,dice.dice))}>Roll</div>
            </div>
          `)}
        </div>
        `)}
      </div>
      <div class="w-100 flex">
        <div class="w-50 pointer link dim underline-hover white tc b bg-green pa1" onClick=${()=> this.clone()}>Clone</div>
        <div class="w-50 pointer link dim underline-hover white tc b bg-green pa1" onClick=${()=> this.save()}>Save</div>
      </div>
    </div>
    `
  }
}

/*
  SUB UI Components  
*/
const DieDropdown = (app,dice) => {
  const DieSteps = [4, 6, 8, 10, 12]
  const {html} = app
  
  return html`
  <div class="flex mh1">
    ${dice.map((d,j)=> html`
    <div class="dropdown">
      <div class="blue link pointer dim underline-hover hover-orange">
        <img src="img/d"${d}"-fill-sm.png" width="35" height="35"></img>
      </div>
      <div class="dropdown-content w-100 bg-white ba bw1 pa1" style="min-width:50px;">
        <div class="link pointer underline-hover ${dice.length == 1 ? "hidden" : ""}" onClick=${()=>app.refresh(dice.splice(j,1))}>
          <img src="img/x-sm.png" width="35" height="35"></img>
        </div>
        ${DieSteps.map(dt=>html`
        <div class="link pointer underline-hover" onClick=${()=>app.refresh(dice[j] = dt)}>
          <img src="img/d"${dt}"-fill-sm.png" width="35" height="35"></img>
        </div>`)}
      </div>
    </div>
    `)}
  </div>
  `
}

export {DicePool}
