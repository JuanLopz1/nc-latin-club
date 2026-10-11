// Original synthesized room mix. No audio is fetched, sampled or started on load.
export function startRetroSound(volume:number){
 const context=new AudioContext(),master=context.createGain();master.gain.value=volume*.3;master.connect(context.destination);
 const chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],beat=60/92;
 let next=context.currentTime+.08,step=0;
 const hz=(midi:number)=>440*2**((midi-69)/12);
 const note=(midi:number,when:number,length:number,level:number,type:OscillatorType)=>{const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=type;oscillator.frequency.value=hz(midi);gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(level,when+.035);gain.gain.exponentialRampToValueAtTime(.0001,when+length);oscillator.connect(gain);gain.connect(master);oscillator.start(when);oscillator.stop(when+length+.02);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};};
 const schedule=()=>{while(next<context.currentTime+.3){const chord=chords[Math.floor(step/16)%chords.length];note(chord[(step%8)%3]+12,next,beat*.7,.05,'triangle');if(step%4===0)note(chord[0]-12,next,beat*1.5,.09,'sine');if(step%16===0)chord.forEach(midi=>note(midi,next,beat*7,.025,'sine'));if(step%4===0)note(24,next,.14,.07,'sine');next+=beat/2;step++;}};
 const timer=window.setInterval(schedule,100);schedule();
 return {resume:()=>context.resume(),volume:(value:number)=>master.gain.setTargetAtTime(value*.3,context.currentTime,.08),stop:()=>{window.clearInterval(timer);master.disconnect();void context.close();}};
}
