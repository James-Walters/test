      var cluster = require('cluster');
  var logger = require('./server/logger');

    var environment = process.env.NODE_ENV || 'development';
var shouldUseClustering = ['zqa','zstaging','zproduction-pre','zproduction'].some(function(potentialEnvironment){
  return environment === potentialEnvironment;
});

   if (cluster.isMaster && shouldUseClustering) {
  var cpuCount = require('os').cpus().length;

  // Will start the app 4 times on a 4-CPU machine.
  // Therefore you'd see 4x as many logs.
  do {
    cluster.fork();
  } while (--cpuCount);

  cluster.on('exit', function (worker) {
    logger('warn', 'Cluster worker ' + worker.id + ' exited.');
    cluster.fork();
  });
   } else {
  process.on('uncaughtException', function (error) {
    logger('error', {
      context: 'cluster',
      stack: error.stack,
      message: error.message,
      filename: __filename
    }, function(){
      process.exit(1);
    });
  });
  require('./server').app.start();
     cluster.worker && logger('info', 'Worker ' + cluster.worker.id + ' running.');
}
