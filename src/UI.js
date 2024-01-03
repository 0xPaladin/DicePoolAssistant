/*
  Useful Functions 
*/
import {BuildArray, SpliceOrPush, chance} from "./random.js"

const DieSteps = [4, 6, 8, 10, 12]

/*
  SUB UI Components  
*/
const DieDropdown = (app,dSet,i) => {
  const {html} = app
  let {dice} = dSet.dice[i]
  
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


/*
  UI Resources  
*/

const Main = (app)=>{
  const {html} = app

  const show = (what)=>{
    app.dialog = ""
    app.show = what
  }

  return html`
  <div class="flex flex-column justify-center m-auto mw6">
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>show("Roll")}><i>Roll Dice</i></div>
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.makePool()}><i>Manage Pools</i></div>
  </div>
  `
}

const Roll = (app)=>{
  const {html, state} = app
  let {activePools} = state 
  let toRoll = Object.entries(state.toRoll)
  let allPools = Object.entries(app.Pools)
  let allDice = [4, 6, 8, 10, 12]
  let load = null

  const DiceRoll = ({roll}) => html`
  <div class="flex justify-center">
    ${roll.d.map((_d,i) => html`<div class="relative mh1"><img  src="img/d"${_d}"-outline-sm.png" width="25" height="25"></img><div class="absolute b f4" style="top:50%;left: 50%;transform: translate(-50%, -50%);">${roll.res[i]}</div></div>`)}
  </div>
  `

  return html`
  <div class="flex flex-column justify-center m-auto">
    <div class="flex justify-between mv1">
      <select class="w-100" value=${load} onChange=${(e)=>load = e.target.value}>
        ${allPools.map(([id,p]) => html`
          <option value=${id}>${p.name}</option>
        `)}
      </select>
      <div class="pointer bg-green white b pa2 ${allPools.length == 0 ? "hidden" : ""}" onClick=${()=>load == null ? "" : app.refresh(activePools.push(app.Pools[load]))}>Load</div>
      <div class="pointer bg-green white b pa2" onClick=${()=>app.refresh(activePools.push(new app.DicePool(app)))}>New</div>
    </div>
    <div class="m-auto ${toRoll.length == 0 ? "hidden" : ""}">
      <h2>Dice to Roll</h2>
      <div class="flex">
        ${toRoll.map(([id,dice],i)=> html`
        <div class="ba ma1 pa1">
          <div class="flex items-center justify-between">
            <h4 class="ma0">${dice.name}</h4>
            <div class="pointer white b bg-red pa1" onClick=${()=>app.refresh(delete state.toRoll[id])}>✗</div>
          </div>
          ${dice.map(([n,d],j)=> html`
          <div class="flex items-center mv1">
            <div class="pointer white b bg-red pa1" onClick=${()=>app.refresh(dice.splice(j,1))}>✗</div>
            <div class="mh2">${n}</div> ${d.map(_d => html`<img src="img/d"${_d}"-fill-sm.png" width="25" height="25"></img>`)}
          </div>
          `)}
          ${dice.roll ? DiceRoll(dice) : ""}
        </div>
        `)}
      </div>
      <div class="pointer tc white b br2 bg-green pa2" onClick=${()=>app.roll()}>Roll</div>
    </div>
    <h2 class=${activePools.length == 0 ? "hidden" : ""}>Active Pools</h2>
    <div class="flex">
      ${activePools.map(P => P.UI())}
    </div>
  </div>
  `
}

const MakePool = (app)=>{
  const {html} = app
  let allPools = Object.entries(app.Pools)
  let pool = app.state.newPool
  let allDice = [4, 6, 8, 10, 12]
  let load = null

  const DieSetUI = (i)=>{
    let dSet = pool.sets[i]
    
    return html`
    <div class="ba ma1 pa1">
      <div class="flex justify-between">
        <input class="f6 tc w-100" type="text" value=${dSet.name} onChange=${(e)=>dSet.name = e.target.value}></input>
        <div class="pointer bg-green white b ma1 pa2" onClick=${()=>pool.addDie(i)}>+Die</div>
      </div>
      ${dSet.dice.map((die,j) => {
        return html`
        <div class="flex items-center justify-between">
          <input class="f6 tc" type="text" value=${die.name} onChange=${(e)=>die.name = e.target.value}></input>
          <div class="flex items-center mh1">
            ${DieDropdown(app,dSet,j)}
            <div class="pointer white b bg-green pa1" onClick=${()=>app.refresh(die.dice.push(6))}>+1</div>
            <div class="pointer white b bg-red pa1" onClick=${()=>app.refresh(dSet.dice.splice(j,1))}>✗</div>
          </div>
        </div>
        ` 
      })}
    </div>
    `
  }

  return html`
  <div class="flex flex-column justify-center m-auto">
    <div class="flex justify-between mv1">
      <select class="w-100" value=${load} onChange=${(e)=>load = e.target.value}>
        ${allPools.map(([id,p]) => html`
          <option value=${id}>${p.name}</option>
        `)}
      </select>
      <div class="pointer bg-green white b pa2" onClick=${()=>app.updateState("newPool", app.Pools[load])}>Load</div>
    </div>
    <div class="flex justify-between">
      <input class="f6 tc w-100 pa1" type="text" value=${pool.name} onChange=${(e)=>pool.name = e.target.value}></input>
      <div class="pointer bg-green white b ma1 pa2" onClick=${()=>pool.save()}>Save</div>
    </div>
    <div class="flex items-center">
      <h3>Dice Sets</h3>
      <div class="pointer bg-green white b ma1 pa2" onClick=${()=>pool.addSet()}>Add Set</div>
    </div>
    <div class="flex">
      ${pool.sets.map((ds,i) => DieSetUI(i))}
    </div>
  </div>
  `
}

const D = {
  Main
}
const Dialog = (app)=>{
  let[what,id,ui] = app.state.dialog.split(".")

  return app.html`
  <div class="fixed z-2 top-1 left-1 bottom-1 right-1 flex items-center justify-center">
    <div class="overflow-y-auto o-90 bg-washed-blue br3 shadow-5 pa2">
      ${app[what] ? app[what][id][ui] : D[what] ? D[what](app) : ""}
    </div>
  </div>`
}

export {Main, Dialog, MakePool, Roll}
