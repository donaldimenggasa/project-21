const runJob = {
  task: async ({ paramsDefault }) => {
    const { ioServer } = paramsDefault;
    try{
      ioServer.emit('fids_force_update', { 
        message: 'Pesan dari loader',
        audioUrl : `null`
    });
    }catch(e){
      console.log('error monitoring')
    }
  },
  options: {
    rule: "*/30 * * * *",
  },
}

export { runJob };