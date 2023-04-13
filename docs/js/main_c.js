const DICT_PATH="./dict";const SHORT_LIMIT=50;const MID_LIMIT=100;const LONG_LIMIT=400;const DEBUG=false;let checkStatus=false;function setDom(tokens){str="";let ng_index=0;let ng_type="";let my_index=0;let my_type="";let t;let kind;let flag;tokens.forEach((token,index)=>{if(index>0&&index==ng_index){str+=`<span class="warning ${ng_type}">${token["surface_form"]}</span>`;ng_type="";return}if(index>0&&index==my_index){str+=`<span class="notice ${my_type}">${token["surface_form"]}</span>`;my_type="";return}if(token["warning"]){t=token["warning"].split("_");flag=t[0];t.shift();kind=t.join("_");if(kind==="desuga"){ng_index=index+1;ng_type=kind;str+=`<span class="warning ${ng_type}">${token["surface_form"]}</span>`;return}str+=`<span class="warning ${token["warning"]}">${token["surface_form"]}</span>`;return}if(token["notice"]){t=token["notice"].split("_");flag=t[0];t.shift();kind=t.join("_");if(flag==="my"){my_index=index+1;my_type=kind;str+=`<span class="notice ${my_type}">${token["surface_form"]}</span>`;return}str+=`<span class="notice ${token["notice"]}">${token["surface_form"]}</span>`;return}if(/^[\n|\r\n|\r]+?/g.test(token["surface_form"])){const rep_ary=token["surface_form"].split("").map(text=>{return"<br>\n"});str+=rep_ary.join("");return}str+=token["surface_form"]});let dom=document.getElementById("response");dom.innerHTML=str}function showDetail(id){if(/^my_/.test(id)){id=id.replace("my_","")}if(document.getElementById(id)){document.getElementById(id).style.display="block"}}function checkNotice(kuten,base,limit=MID_LIMIT){if(Object.keys(kuten).length==0){return false}const temp={};for(let key in base){let min=1;base[key].forEach((hash,index)=>{const word_position=hash["word_position"];if(!base[key][index+1]){if(base[key][index-1]&&base[key][index-1]["word_position"]<word_position+limit){if(!temp[key]){temp[key]=[]}temp[key].push(hash)}return}if(base[key][index+1]["word_position"]<word_position+limit){if(!temp[key]){temp[key]=[]}temp[key].push(hash)}})}const ret={};for(let key in temp){if(temp[key].length>1){ret[key]=temp[key]}}return ret}function check(){if(checkStatus){alert("只今解析中です…");return false}const story=document.getElementById("base_text").value;if(story==""){return false}const notice={};const ids=[];const names=[];const warnings={};const joshi={};const kandoshi={};const ng_phrase={};const my_phrase={};const talk_phrase={};const kuten=[];const setsuzokushi={};const new_tokens=[];const warning_flags=[];kuromoji.builder({dicPath:DICT_PATH}).build((err,tokenizer)=>{checkStatus=true;const tokens=tokenizer.tokenize(story);tokens.forEach((token,index)=>{const new_token={surface_form:token.surface_form,word_position:token.word_position};let before=tokens[index-1]?tokens[index-1]:false;let b_before=tokens[index-2]?tokens[index-2]:false;let next=tokens[index+1]?tokens[index+1]:false;let n_next=tokens[index+2]?tokens[index+2]:false;if(DEBUG){console.log(token)}if(token.pos==="記号"&&token.surface_form==="。"){kuten.push(token.word_position)}if(token.pos==="記号"&&next&&next.pos==="記号"){if(token.surface_form==="」"&&(next.surface_form==="、"||next.surface_form==="。")){if(!warnings["double_pos"]){warnings["double_pos"]=[]}new_token["warning"]="double_pos";warnings["double_pos"].push(token.word_position);if(!warning_flags.includes("double_pos")){warning_flags.push("double_pos")}}if(token.surface_form==="・"&&next.surface_form==="・"&&n_next.surface_form==="・"){if(!warnings["triple_dot"]){warnings["triple_dot"]=[]}new_token["warning"]="triple_dot";warnings["triple_dot"].push(token.word_position);if(!warning_flags.includes("triple_dot")){warning_flags.push("triple_dot")}}if(token.surface_form==="。"&&next.surface_form==="。"&&n_next.surface_form==="。"){if(!warnings["triple_dot"]){warnings["triple_dot"]=[]}new_token["warning"]="triple_dot";warnings["triple_dot"].push(token.word_position);if(!warning_flags.includes("triple_dot")){warning_flags.push("triple_dot")}}if(token.surface_form==="、"&&/^\n/g.test(next.surface_form)){if(!warnings["break_pos"]){warnings["break_pos"]=[]}new_token["warning"]="break_pos";warnings["break_pos"].push(token.word_position);if(!warning_flags.includes("break_pos")){warning_flags.push("break_pos")}}}if(next){if(token.pos==="記号"&&(token.surface_form==="、"||token.surface_form==="。")&&next.pos==="記号"&&(next.surface_form==="」"||next.surface_form==="』")){if(!my_phrase["my_iikiri"]){my_phrase["my_iikiri"]=[]}my_phrase["my_iikiri"].push({word_position:token.word_position,index:index})}if(token.pos==="助詞"&&next.pos==="助詞"){if(!my_phrase["my_doubule_joshi"]){my_phrase["my_doubule_joshi"]=[]}my_phrase["my_doubule_joshi"].push({word_position:token.word_position,index:index})}if(token.pos==="助動詞"&&token.surface_form==="です"&&next.pos==="助詞"&&next.surface_form==="が"){if(!ng_phrase["ng_desuga"]){ng_phrase["ng_desuga"]=[]}ng_phrase["ng_desuga"].push({word_position:token.word_position,index:index})}}if(before){if(token.pos=="助詞"&&token.surface_form==="という"&&before.surface_form!="」"&&before.surface_form!="』"&&!/^\n+/g.test(before.surface_form)){if(before.pos!="助詞"){if(!talk_phrase["talk"]){talk_phrase["talk"]=[]}talk_phrase["talk"].push({word_position:token.word_position,index:index})}}if(token.pos=="助詞"&&token.surface_form==="と"&&before.pos!="名詞"&&before.surface_form!="」"&&before.surface_form!="』"&&!/^\n+/g.test(before.surface_form)){if(before.pos=="形容詞"||b_before&&b_before.pos=="形容詞"){if(!talk_phrase["talk"]){talk_phrase["talk"]=[]}talk_phrase["talk"].push({word_position:token.word_position,index:index})}}}if(token.pos=="助詞"&&token.surface_form==="ほど"){if(!ng_phrase["ng_hodo"]){ng_phrase["ng_hodo"]=[]}ng_phrase["ng_hodo"].push({word_position:token.word_position,index:index})}if(token.pos=="助詞"&&token.surface_form==="ので"){if(!ng_phrase["ng_node"]){ng_phrase["ng_node"]=[]}ng_phrase["ng_node"].push({word_position:token.word_position,index:index})}if(token.pos=="助詞"&&token.surface_form==="など"){if(!ng_phrase["ng_nado"]){ng_phrase["ng_nado"]=[]}ng_phrase["ng_nado"].push({word_position:token.word_position,index:index})}if(token.pos==="助詞"){if(!joshi[token.surface_form]){joshi[token.surface_form]=[]}joshi[token.surface_form].push({word_position:token.word_position,index:index})}if(token.pos==="感動詞"){if(!kandoshi[token.surface_form]){kandoshi[token.surface_form]=[]}kandoshi[token.surface_form].push({word_position:token.word_position,index:index})}if(token.pos==="接続詞"){if(!setsuzokushi[token.surface_form]){setsuzokushi[token.surface_form]=[]}setsuzokushi[token.surface_form].push({word_position:token.word_position,index:index})}new_tokens.push(new_token)});const notice_list=[{name:"joshi",data:joshi,limit:SHORT_LIMIT},{name:"kandoshi",data:kandoshi,limit:LONG_LIMIT},{name:"setsuzokushi",data:setsuzokushi,limit:SHORT_LIMIT}];notice_list.forEach(notice_detail=>{const name=notice_detail["name"];const data=notice_detail["data"];const limit=notice_detail["limit"];const ret=checkNotice(kuten,data,limit);if(!ret){return}showDetail(name);for(let key in ret){ret[key].forEach(hash=>{const index=hash["index"];const base=new_tokens[index];base["notice"]=name;new_tokens[index]=base})}});if(my_phrase){for(let key in my_phrase){notice[key]=key;showDetail(key);my_phrase[key].forEach(hash=>{const index=hash["index"];const base=new_tokens[index];base["notice"]=key;new_tokens[index]=base})}}if(ng_phrase){showDetail("warning");for(let key in ng_phrase){let next_insert=false;ng_phrase[key].forEach((hash,i)=>{const index=hash["index"];const word_position=hash["word_position"];let base=new_tokens[index];if(next_insert){base["warning"]=key;if(base["notice"]){delete base["notice"];delete new_tokens[index]["notice"]}new_tokens[index]=base;next_insert=false;return}if(ng_phrase[key][i+1]){if(base.word_position+SHORT_LIMIT>ng_phrase[key][i+1]["word_position"]){base["warning"]=key;if(base["notice"]){delete base["notice"];delete new_tokens[index]["notice"]}new_tokens[index]=base;next_insert=true;return}next_insert=false;return}if(!ng_phrase[key][i+1]&&ng_phrase[key][i-1]){if(base.word_position-SHORT_LIMIT<ng_phrase[key][i-1]["word_position"]){next_insert=true}else{next_insert=false;return}}if(next_insert){base["warning"]=key;if(base["notice"]){delete base["notice"];delete new_tokens[index]["notice"]}new_tokens[index]=base;next_insert=false;return}next_insert=false})}}if(talk_phrase){showDetail("talk");talk_phrase["talk"].forEach(hash=>{const index=hash["index"];let base=new_tokens[index];if(base["notice"]){delete base["notice"];delete new_tokens[index]["notice"]}base["notice"]="talk";new_tokens[index]=base})}warning_flags.forEach(flag=>{showDetail(flag)});checkStatus=false;if(DEBUG){console.log(new_tokens)}setDom(new_tokens);document.getElementById("detail").style.display="block";return false})}document.addEventListener("DOMContentLoaded",()=>{document.getElementById("check").addEventListener("click",()=>{check()})});