import fs from 'fs';
import Router from 'koa-router';

const route = new Router;

export function loader() {

    const dirs = fs.readdirSync(__dirname + '/router');
    console.log(dirs)
    dirs.forEach((filename) => {
        const mod = require(__dirname + '/router/' + filename).default;
        console.log(mod)
        Object.keys(mod).map((key) => {
            const [method, path] = key.split(' ');
            const handler = mod[key];
            (<any>route)[method](path, handler);
        })
    })
    return route.routes();
}