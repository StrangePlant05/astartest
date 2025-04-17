let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let nodesCheckbox = document.getElementById("woah");

let jump;

let keys = [];
let walls = [];
let nodes = [];
let nodeSpacing = 50;
let nodeHorizontalThreshold = 150;
let nodeVerticalThreshold = 60;



let path;

let player = {
    x: window.innerWidth/2,
    y: window.innerHeight/2,
    width: 20,
    height: 20,
    color: "red",
    dx: 0,
    vx: 0,
    vy: 0,
    speed: 300,
    gravity: 1200,
    jump: true,
}



function collisionDetect() {
    for (let i = 0; i < walls.length; i++) {
        let colliding = player.x + player.width > walls[i].x && 
                        player.x < walls[i].x + walls[i].width && 
                        player.y + player.height > walls[i].y && 
                        player.y < walls[i].y + walls[i].height;
        if (colliding) {
            return {colliding: true, wall: walls[i]};
        }
    }
    return {colliding: false};
}

function collisionDetectObjects(obj1, point) { 
    if (!point || !obj1) return false;
    let colliding = point.x >= obj1.x &&
                    point.x <= obj1.x + obj1.width &&
                    point.y >= obj1.y &&
                    point.y <= obj1.y + obj1.height;
    return colliding;
}



function playerUpdate(deltaTime) {
    // if ((keys["a"] || keys["ArrowLeft"]) && (keys["d"] || keys["ArrowRight"]) || (!(keys["a"] || keys["ArrowLeft"]) && !(keys["d"] || keys["ArrowRight"]))) {
    //     player.dx = 0;
    // } else if (keys["ArrowLeft"] || keys["a"]) {
    //     player.dx = -1;
    // } else if (keys["ArrowRight"] || keys["d"]) {
    //     player.dx = 1;
    // }

    jump = () => {
        if (player.jump) return;
        player.vy = -player.speed * 1.5;
        player.jump = true;
    }

    
    player.vx = player.speed * player.dx;
    player.x += player.vx * deltaTime;

    if (collisionDetect().colliding) {
        let wall = collisionDetect().wall;
        if (player.x + player.width > wall.x && player.x < wall.x + wall.width) {
            if (player.vx > 0) {
                player.x = wall.x - player.width - 0.01;
            } else if (player.vx < 0) {
                player.x = wall.x + wall.width + 0.01;
            }
        }

    }
    
    player.vy += player.gravity * deltaTime;
    player.y += player.vy * deltaTime;
    
    if (collisionDetect().colliding) {
        let wall = collisionDetect().wall;
        if (player.y + player.height > wall.y && player.y < wall.y + wall.height) {
            if (player.vy > 0) {
                player.y = wall.y - player.height - 0.01;
                player.vy = 0;
                player.jump = false;
            } else if (player.vy < 0) {
                player.y = wall.y + wall.height + 0.01;
                player.vy = 0;
            }
        }
    }

    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.vy = 0;
        player.jump = false;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.vx = 0;
    }
    if (player.x < 0) {
        player.x = 0;
        player.vx = 0;
    }
    
    context.fillStyle = player.color;
    context.fillRect(player.x, player.y, player.width, player.height);
}

function drawWalls() {
    for (let i = 0; i < walls.length; i++) {
        context.fillStyle = walls[i].color;
        context.fillRect(walls[i].x, walls[i].y, walls[i].width, walls[i].height);
        console.log("aa");
    }

}

function drawNodes() {
    for (let i = 0; i < nodes.length; i++) {
        context.fillStyle = "blue";
        if (nodes[i].isEdge) {
            context.fillStyle = "green";
        }
        context.fillRect(nodes[i].x, nodes[i].y, 5, 5);

        for (let j = 0; j < nodes[i].neighbors.length; j++) {
            context.beginPath();
            context.moveTo(nodes[i].x + 2.5, nodes[i].y + 2.5);
            context.lineTo(nodes[i].neighbors[j].x + 2.5, nodes[i].neighbors[j].y + 2.5);
            context.strokeStyle = "blue";
            context.lineWidth = 1;
            context.stroke();
        }
    }
}

let currentPathIndex = 1;

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    let now = performance.now();
    let deltaTime = (now - (player.lastTime || now)) / 1000;
    player.lastTime = now;

    drawWalls();
    if (nodesCheckbox.checked) drawNodes();

    if (path) {
        if (collisionDetectObjects(player, {x: path[currentPathIndex].x, y: path[currentPathIndex].y - 3})) {
            currentPathIndex++;
            if (currentPathIndex >= path.length) {
                currentPathIndex = 0;
                path = null;
            }
    
        }
        pathFind(path, currentPathIndex);
    }

    playerUpdate(deltaTime);
    requestAnimationFrame(gameLoop);
}

gameLoop();

document.addEventListener("keydown", function(event) {
    // if (event.key == " " || event.key == "w" && !event.repeat) { 
    //     jump();
    // }
    keys[event.key] = true;

    if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        if (walls.length > 0) {
            let lastWall = walls.pop();

            let nodesLength = 0;

            while (lastWall.x + (nodesLength * nodeSpacing) < lastWall.width + lastWall.x) {
                nodesLength++;
            }

            nodesLength ++;

            for (let i = 0; i < nodesLength; i++) {
                nodes.pop();
            }
        }
    }
});

document.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});

let mouseMoveListener;

let startX;
let startY;
let endX;
let endY;
let box;




document.addEventListener("mousedown", function(event) {

    if (event.button == 2 && !keys["Mouse3"]) {
        console.log(event.button);
        path = astar({x: player.x, y: player.y}, {x: event.clientX, y: event.clientY});
        console.log(path);

    }

    if (event.button == 0 && !keys["Mouse1"]) {
        if (event.button == 0) {
            box = document.createElement("div");
            box.style.position = "absolute";
            box.style.top = event.clientY + "px";
            box.style.left = event.clientX + "px";
            box.style.zIndex = -100;

            startX = event.clientX;
            startY = event.clientY;
        }

        
        mouseMoveListener = function(event) {
            keys["MouseX"] = event.clientX;
            keys["MouseY"] = event.clientY;

            endX = event.clientX;
            endY = event.clientY;

            if (Math.sign(event.clientX - startX) == -1) {
                box.style.left = event.clientX + "px";
            }
            if (Math.sign(event.clientY - startY) == -1) {
                box.style.top = event.clientY + "px";
            }
            
            box.style.width = Math.abs(event.clientX - startX) + "px";
            box.style.height = Math.abs(event.clientY - startY) + "px";
            box.style.boxSizing = "border-box";
            box.style.border = "5px solid lightblue";
        }
        document.addEventListener("mousemove", mouseMoveListener);

        document.body.appendChild(box);
    }
    
    keys["Mouse"+(event.button + 1)] = true;
});

document.addEventListener("mouseup", function(event) {
    keys["Mouse"+(event.button + 1)] = false;
    
    if (mouseMoveListener) {
        document.removeEventListener("mousemove", mouseMoveListener);
        mouseMoveListener = null;

        let wall = {
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            width: Math.abs(endX - startX),
            height: Math.abs(endY - startY),
            color: "aquamarine",
        }

        for (let i = wall.x; i < wall.x + wall.width; i += nodeSpacing) {
            let node = {x: i, y: wall.y};
            node.neighbors = [];

            node.isEdge = i == wall.x;

            for (let j = 0; j < nodes.length; j++) {
                if (Math.abs(nodes[j].x - node.x) < nodeHorizontalThreshold && Math.abs(nodes[j].y - node.y) < nodeVerticalThreshold) {
                    node.neighbors.push(nodes[j]);
                }
            }

            nodes.push(node);
        }

        let rightEdgeNode = {x: wall.x + wall.width, y: wall.y};
        rightEdgeNode.neighbors = [];
        rightEdgeNode.isEdge = true;
        for (let j = 0; j < nodes.length; j++) {
            if (Math.abs(nodes[j].x - rightEdgeNode.x) < nodeHorizontalThreshold && Math.abs(nodes[j].y - rightEdgeNode.y) < nodeVerticalThreshold) {
                rightEdgeNode.neighbors.push(nodes[j]);

                nodes[j].neighbors.push(rightEdgeNode);
            }
        }
        
        nodes.push(rightEdgeNode);

        walls.push(wall);

        document.body.removeChild(box);
        box = null;
    }
});

document.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});

function astar(start, end) {
    let closedSet = [];
    
    let path = [start];

    let nodesClone = nodes.map(node => ({...node})); // Clone nodes
    nodesClone.push(start);
    nodesClone.push(end);

    start.neighbors = [];
    end.neighbors = [];

    for (let j = 0; j < nodes.length; j++) {
        if (Math.abs(nodesClone[j].x - start.x) < nodeHorizontalThreshold && Math.abs(nodesClone[j].y - start.y) < nodeVerticalThreshold) {
            start.neighbors.push(nodesClone[j]);
            nodesClone[j].neighbors.push(start);
        }
    }

    for (let j = 0; j < nodesClone.length; j++) {
        if (Math.abs(nodesClone[j].x - end.x) < nodeHorizontalThreshold && Math.abs(nodesClone[j].y - end.y) < nodeVerticalThreshold) {
            end.neighbors.push(nodesClone[j]);
            nodesClone[j].neighbors.push(end);
        }
    }

    while (true) {
        let currentNode = path[path.length - 1];
        console.log(currentNode)
        let neighbors = currentNode.neighbors;

        let chosenNode = null;

        closedSet.push(currentNode);

        neighbors.forEach(neighbor => {
            let dx = Math.abs(neighbor.x - currentNode.x);
            let dy = Math.abs(neighbor.y - currentNode.y);

            if (!closedSet.includes(neighbor)) {
                // if (dx < nodeHorizontalThreshold && dy < nodeVerticalThreshold) {
                //     if (chosenNode && Math.abs(chosenNode.x - currentNode.x) > dx && Math.abs(chosenNode.y - currentNode.y) > dy) {
                //         chosenNode = neighbor;
                //     } else {
                //         chosenNode = neighbor;
                //     }
                // }

                let currentNeighborDistance = Math.sqrt(dx ** 2 + dy ** 2);
                let chosenNodeDistance = chosenNode ? Math.sqrt(Math.abs(chosenNode.x - currentNode.x) ** 2 + Math.abs(chosenNode.y - currentNode.y) ** 2) : Infinity;
                if (currentNeighborDistance < chosenNodeDistance) {
                    chosenNode = neighbor;
                }
            }

        });

        if (!chosenNode && currentNode.x != end.x && currentNode.y != end.y) {
            path.pop();
            if (path.length == 0) {
                return null;
            }
        } else if (currentNode.x == end.x && currentNode.y == end.y) {
            if (chosenNode) {
                path.push(chosenNode); // Only push if chosenNode is not null
            }
            return path;
        }

        if (chosenNode) {
            path.push(chosenNode); // Only push if chosenNode is not null
        }
    }

}

function pathFind(path, currentNodeIndex) {
    if (!path || !currentNodeIndex || currentNodeIndex >= path.length) {
        player.dx = 0;
        return;   
    }
    let currentNode = path[currentNodeIndex];

    let dx = player.x - currentNode.x  + (player.width / 2);

    player.dx = Math.sign(-dx);

    if (player.y + player.height > currentNode.y) {
        jump();
    }

    console.log(player.y, currentNode.y)

}