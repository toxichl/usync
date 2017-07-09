var Usync = require('../dist/Usync')
var app = Usync.createApp()

var task1 = (root, next) => {
    root.name = 'Usync'
    console.log('Task 1')
    setTimeout(() => next(), 2000)
}

var task2 = (root, next) => {
    root.desc = 'Serial task control'
    console.log('Task 2')
    setTimeout(() => next(), 2000)
}

var task3 = root => {
    console.log('Task 3')
    console.log(root)
    setTimeout(() => next(), 2000)
}

app.use(task1).use(task2).use(task3)

app.start()
