const res = 3;
const blocks = [];
const pieces = [];

let won = false;
let cond = [];

for (let i = 0; i < res * res; i++)
{
    cond[i] = false;
}

function newLine()
{
    document.body.appendChild(document.createElement("br"));
}

for (let i = 0, k = 1; i < res; i++)
{
    newLine();
    
    for (let j = 0; j < res; j++)
    {  
        const block = document.createElement("div");

        block.style.width = "128px";
        block.style.height = "128px";
        block.style.position = "absolute";
        block.style.left = String(500 + 128 * j) + "px";
        block.style.top = String(60 + 128 * i) + "px";
        block.style.border = "2px solid black";

        block.setAttribute("ondrop", "Drop_Handler(event)");
        block.setAttribute("ondragover", "DragOver_Handler(event)");

        block.occupied = false;
        block.num = k;
        
        blocks.push(block);
        document.body.appendChild(block);

        k++;
    }
}

newLine();

let pieceNums = [ 1, 2, 3, 4, 5, 6, 7, 8, 9],
    ranNums = [],
    i = pieceNums.length,
    j = 0;

while (i--) {
    j = Math.floor(Math.random() * (i+1));
    ranNums.push(pieceNums[j]);
    pieceNums.splice(j,1);
}

for (i = 0; i < res * res; i++)
{
    const piece = document.createElement("img");
    piece.id = String(ranNums[i]);

    piece.style.width = "128px";
    piece.style.height = "128px";
    piece.style.marginLeft = "4px";
    piece.style.marginTop = "4px";
    piece.src = "Assets/"+String(ranNums[i])+".png";

    piece.draggable = true;
    piece.setAttribute("ondragstart", "DragStart_Handler(event)");
    piece.setAttribute("ondragend", "DragEnd_Handler(event)");

    piece.num = ranNums[i];

    pieces.push(piece);
    document.getElementById("imageBox").appendChild(piece);
}

let selectedBlock;

function DragStart_Handler(ev)
{
    if (won) return;
    
    ev.dataTransfer.setData("text", ev.target.id);

    ev.target.selected = true;
    ev.target.style.border = "3px solid green";
    selectedBlock = ev.target.block;

    for (i = 0; i < pieces.length; i++)
    {
        if (pieces[i] != ev.target)
        {
            pieces[i].selected = false;
            pieces[i].style.border = "";
        }
    }
}

function DragOver_Handler(ev)
{
    ev.preventDefault();
}

function Drop_Handler(ev)
{
    ev.preventDefault();
    
    blocks.forEach(block =>
    {
        if (block == selectedBlock && block != ev.target && !ev.currentTarget.occupied)
        {
            cond[block.num-1] = false;
            block.occupied = false;
            block.style.border = "2px solid black";
        }
    });
    
    pieces.forEach(piece =>
    {
        if (piece.selected && !ev.currentTarget.occupied)
        {
            if (ev.currentTarget.num != undefined)
            {
                ev.currentTarget.occupied = true;
                ev.currentTarget.piece = piece;
                piece.block = ev.currentTarget;
                
                if (piece.num == ev.currentTarget.num)
                {
                    cond[ev.currentTarget.num-1] = true;
                    ev.currentTarget.style.border = "2px solid green";
                }

                piece.style.marginLeft = "";
                piece.style.marginTop = "";
            }
            else
            {
                piece.style.marginLeft = "4px";
                piece.style.marginTop = "4px";
            }
            
            let id = ev.dataTransfer.getData("text");
            ev.currentTarget.appendChild(document.getElementById(id));

            piece.selected = false;

            piece.style.border = "";   
        }
    });

    CheckWin();
}

function DragEnd_Handler(ev)
{
    ev.dataTransfer.clearData();
}

pieces.forEach(piece =>
{
    piece.addEventListener("click", function()
    {
        piece.selected = true;
        piece.style.border = "1px solid green";
        selectedBlock = piece.block;

        for (i = 0; i < pieces.length; i++)
        {
            if (pieces[i] != piece)
            {
                pieces[i].selected = false;
                pieces[i].style.border = "";
            }
        }
    });
});

function CheckWin()
{
    if (won) return;

    for (i = 0; i < cond.length; i++)
    {
        if (!cond[i])
        {
            return;
        }
    }

    const p = document.createElement("p");
    const winText = document.createTextNode("You solved the puzzle!");
    p.style.position = "absolute";
    p.style.left = "45%";
    p.style.top = "75%";
    
    p.appendChild(winText);
    document.body.appendChild(p);

    won = true;
}