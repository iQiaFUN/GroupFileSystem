const ProgressBar = require('progress');
const path = require('path');
const tmpcfg = JSON.parse(NIL.IO.readFrom(path.join(__dirname, 'example.json')));

function checkFile(file, text) {
    if (NIL.IO.exists(path.join(__dirname, file)) == false) {
        NIL.IO.WriteTo(path.join(__dirname, file), text);
    }
}

checkFile("config.json", JSON.stringify(tmpcfg, null, '\t'));
const cfg = JSON.parse(NIL.IO.readFrom(path.join(__dirname, 'config.json')));
const vcfg = NIL._vanilla.cfg;
const backup_path = path.join(__dirname,cfg.path);
class Groupfs extends NIL.ModuleBase{
    onStart(api){
        api.listen('onMainMessageReceived',(e)=>{
            if(e.raw_message==cfg.cmd){
                if(NIL._vanilla.isAdmin(e.sender.qq)){
                    let group_id = cfg.group
                    if(group_id == 114514){
                        group_id = e.group.id
                    }
                    let FS = NIL.bots.getBot(e.self_id).acquireGfs(group_id);
                    let list=NIL.IO.getFilesList(backup_path);
                    let arr = [];
                    let i = 0;
                    for(let m in list){
                        arr[i]= {
                            name:m,
                            btime:(list[m].birthtimeMs).toFixed()
                        }
                        i++;
                    }
                    arr.sort(compare('btime'));
	                arr.reverse();
                    api.logger.info(arr[0].name);
                    
                    FS.upload(
                        path.join(backup_path,arr[0].name),
                        '/',
                        arr[0].name,
                        (p)=>{
                            let bar = new ProgressBar(`上传中${p}%[ :bar>]`,100)
                            bar.tick(p);
                            if(bar.complete){
                                api.logger.info('上传完成');
                                NIL.bots.getBot(vcfg.self_id).sendGroupMsg(vcfg.group.main,`${arr[0].name}上传成功`)
                            }
                        }
                    );
                }else{
                    e.reply(`你不是管理员，无法进行此操作!`)
                }
            }
        })
    }

    onStop(){}
}

function compare(prop){
	return function(a,b) {
		var value1 = a[prop];
		var value2 = b[prop];
		return value1-value2
	}
}

module.exports = new Groupfs;