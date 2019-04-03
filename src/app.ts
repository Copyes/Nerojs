import cluster from 'cluster'
import { Nero } from './core'

if(cluster.isMaster){
  const numWorkers = require('os').cpus().length
  console.log('Master cluster setting up ' + numWorkers + ' workers...')

    for (var i = 0; i < numWorkers; i++) {
        cluster.fork()
    }

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online')
    })

    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal)
        console.log('Starting a new worker')
        cluster.fork()
    })

} else {
  const app = new Nero
  app.run(() => {
    console.log('server has been started')
  })
}
