const canvas= document.
  querySelector('canvas')
const c= canvas.getContext('2d')
canvas.width=1535
canvas.height=745

const scoreEl=document.querySelector('#scoreEl')
const startGameBtn=document.querySelector('#startGameBtn')
const modalEl=document.querySelector('#modalEl')
const bigScoreEl=document.querySelector('#bigScoreEl')

class Player{
    constructor(color){
        this.x=100
        this.y=canvas.height-100
        this.color=color
        this.velocity={
            x:0,
            y:0
        }
        this.grounded=false
    }
    draw(){
        c.beginPath()
        c.rect(this.x,this.y,40,40)
        c.fillStyle=this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x+=this.velocity.x
        this.y+=this.velocity.y
        if(this.y>=canvas.height-40){
            cancelAnimationFrame(animationId)
            modalEl.style.display='flex'
            bigScoreEl.innerHTML=score
        }
        this.velocity.y+=0.2
        this.grounded=false
    }
}
class Floor{
    constructor(length,width=40,x=canvas.width+GP+100){
        this.length=length
        this.width=width
        this.x=x
        this.y=canvas.height-40
        this.copy=true
    }
    draw(){
        c.beginPath()
        c.rect(this.x-GP,this.y-(this.width-40),this.length,this.width)
        c.fillStyle=this.color
        c.fill()
    }
}
class Projectile{
    constructor(x,y,radius,color,velocity,speed){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.speed=speed
    }

    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,2*Math.PI,false)
        c.fillStyle=this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x+=this.velocity.x*this.speed
        this.y+=this.velocity.y*this.speed
    }
}
class Enemy{
    constructor(color,rad){
        this.x=canvas.width+GP+100
        this.y=canvas.height-200
        this.color=color
        this.velocity={
            x:0,
            y:0
        }
        this.rad=rad
    }
    draw(){
        c.beginPath()
        c.rect(this.x-GP,this.y,this.rad,this.rad)
        c.fillStyle=this.color
        c.fill()
    }
    update(){
        this.draw()
        this.x+=this.velocity.x
        this.y+=this.velocity.y
        this.velocity.y+=0.2
    }
}
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.alpha=1
    }

    draw(){
        c.save()
        c.globalAlpha=this.alpha
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,2*Math.PI,false)
        c.fillStyle=this.color
        c.fill()
        c.restore()
    }
    update(){
        this.draw()
        this.x+=this.velocity.x
        this.y+=this.velocity.y
        this.alpha-=0.005
    }
}
GP=0//GamePosition
gamespeed=1

let player=new Player('white')
let floors=[]
let projectiles=[]
let enemies=[]
let particles=[]
score=0

function init(){
    GP=0//GamePosition
    gamespeed=1

    player=new Player('white')
    floors=[]
    projectiles=[]
    enemies=[]
    particles=[]
    score=0
    scoreEl.innerText=score
    bigScoreEl.innerText=score
    floors.push(new Floor(canvas.width+500,40,0))
}
function GPupdate(){
    setInterval(()=>{
        GP+=3*gamespeed
        gamespeed+=0.0003
    },10)
}

function spawnEnemies(){
    setInterval(()=>{
        const radius=Math.random()*(40)+20

        const color='hsl('+Math.random()*360+',100%,50%)'

        enemies.push(new Enemy(color,radius))
    },Math.random()*(2500)+1000)
}

let animationId

function animate(){
    score+=1
    scoreEl.innerHTML=score
    animationId=requestAnimationFrame(animate)
    c.fillStyle='rgba(0,0,0)'
    c.fillRect(0,0,canvas.width,canvas.height)
    player.update()
    floors.forEach((floor,index)=>{
        if(floor.x+floor.length-GP<0){
            setTimeout(()=>{
                floors.splice(index,1)
            },0)
        }else{
            if((floor.x+floor.length-GP<canvas.width) && floor.copy){
                floors.push(new Floor(parseInt(Math.random()*(1000)+150),parseInt(Math.random()*(40)+40),))
                floor.copy=false
            }
            if(player.y+40>=floor.y-(floor.width-40) &&(player.x+40>=floor.x-GP && floor.x-GP+floor.length>=player.x)&&player.y+40<=floor.y-(floor.width-40)+10){
                player.velocity.y=0
                player.grounded=true
                player.y=floor.y-floor.width//+40(地板高度)-40(玩家腳座標)
            }
            floor.draw()
        }
        enemies.forEach((enemy)=>{
            if(enemy.y+enemy.rad>=floor.y-(floor.width-40) &&(enemy.x+enemy.rad>=floor.x && floor.x+floor.length>=enemy.x)){
                enemy.velocity.y=0
                enemy.y=floor.y-floor.width+40-enemy.rad
            }
        })
    })
    enemies.forEach((enemy,index)=>{
        enemy.update()
        const dist=Math.hypot(player.x+20-(enemy.x+enemy.rad/2-GP),
            player.y-enemy.y)

        if(dist<enemy.rad/2+20){
            cancelAnimationFrame(animationId)
            modalEl.style.display='flex'
            bigScoreEl.innerHTML=score
        }
        if((enemy.x+enemy.rad-GP<0)||(enemy.y>canvas.height)){
            setTimeout(()=>{
                enemies.splice(index,1)
            },0)
        }
        projectiles.forEach((projectile,projectileIndex)=>{
            const dist=Math.hypot(projectile.x-(enemy.x-GP),
            projectile.y-enemy.y)

            if(dist<enemy.rad+projectile.radius){
                score+=100
                scoreEl.innerHTML=score
                for(let i=0;i<4;i++){
                    var size=Math.random()*enemy.rad/4
                    particles.push(new Particle(
                            projectile.x,
                            projectile.y,
                            size,
                            enemy.color,
                            {
                            x:(Math.random()-0.5)*(8/size),
                            y:Math.abs((Math.random()-0.5)*(8/size))*-1
                            }
                        ))
                }
                setTimeout(()=>{
                    if(enemy.rad<30){
                        score+=250
                        scoreEl.innerHTML=score
                        enemies.splice(index,1)
                    }else{
                        enemy.rad-=20
                    }

                    projectiles.splice(projectileIndex,1)
                },0)
            }
        })
    })
    c.fillStyle='rgba(0,0,0,0.2)'
    projectiles.forEach((projectile,index)=>{
        projectile.update()
        if(projectile.x-projectile.radius<0
            ||projectile.x+projectile.radius>canvas.width
            ||projectile.y-projectile.radius<0
            ||projectile.y+projectile.radius>canvas.height){
                setTimeout(()=>{
                    projectiles.splice(index,1)
                },0)
            }
    })
    particles.forEach((particle,index)=>{
        if(particle.alpha<=0){
            particles.splice(index,1)
        }else{
            particle.update()
        }
    })
}
addEventListener('keydown',function(e){
    if(e.code=='KeyA'||e.code=='ArrowLeft'){player.velocity.x=-1*gamespeed}
    if(e.code=='KeyD'||e.code=='ArrowRight'){player.velocity.x=1*gamespeed}
    if((e.code=='KeyW'||e.code=='ArrowUp'||e.code=='Space')&& player.grounded){player.velocity.y=-8,player.grounded=false}
    console.log(e.code)
})
addEventListener('keyup',function(e){
    if(e.code=='KeyA'||e.code=='ArrowLeft'){player.velocity.x=0}
    if(e.code=='KeyD'||e.code=='ArrowRight'){player.velocity.x=0}
})
addEventListener('click',(event)=>
{
    const angle=Math.atan2(
    event.clientY-player.y,
    event.clientX-player.x)
    const velocity={
        x:Math.cos(angle),
        y:Math.sin(angle)
    }
    projectiles.push(new Projectile(player.x+20,player.y+20,5,'white',velocity,10))
})
startGameBtn.addEventListener('click',()=>{
    init()
    animate()
    modalEl.style.display='none'
})
GPupdate()
spawnEnemies()