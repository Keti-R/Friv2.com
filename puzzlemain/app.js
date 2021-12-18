const res = 3;
const blocks = [];
const pieces = [];

let cond = [];

for (i = 0; i < res * res; i++)
{
    cond[i] = false;
}

function newLine()
{
    document.body.appendChild(document.createElement("br"));
}

for (i = 0, k = 1; i < res; i++)
{
    newLine();
    
    for (j = 0; j < res; j++)
    {  
        const block = document.createElement("img");

        block.style.width = "128px";
        block.style.height = "128px";
        block.style.position = "absolute";
        block.style.left = String(128 * j) + "px";
        block.style.top = String(128 * i) + "px";

        block.occupied = false;
        block.num = k;
        
        blocks.push(block);
        document.body.appendChild(block);

        k++;
    }
}

newLine();

for (i = 0; i < res * res + 1; i++)
{
    const piece = document.createElement("img");

    piece.style.width = "128px";
    piece.style.height = "128px";
    piece.src = "Assets/piece"+(i+1)+".png";
    piece.style.position = "absolute";
    piece.style.left = String(128 * i) + "px";
    piece.style.top = "512px";

    piece.num = i + 1;

    pieces.push(piece);
    document.body.appendChild(piece);
}

let selectedBlock;

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

blocks.forEach(curBlock =>
{
    curBlock.addEventListener("click", function()
    {
        blocks.forEach(block =>
        {
            if (block == selectedBlock && block != curBlock && !curBlock.occupied)
            {
                cond[block.num-1] = false;
                block.occupied = false;
            }
        });

        pieces.forEach(piece =>
        {
            if (piece.selected && !curBlock.occupied)
            {
                curBlock.occupied = true;
                curBlock.piece = piece;
                piece.block = curBlock;
                
                piece.style.left = curBlock.style.left;
                piece.style.top = curBlock.style.top;
                
                if (piece.num == curBlock.num)
                {
                    cond[curBlock.num-1] = true;
                }

                piece.selected = false;
                piece.style.border = "";
            }
        });

        CheckWin();
    });
});

function CheckWin()
{
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
    p.style.left = "50%";
    p.style.top = "50%";
    
    p.appendChild(winText);
    document.body.appendChild(p);
}