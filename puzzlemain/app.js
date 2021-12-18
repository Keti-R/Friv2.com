const res = 3;
const blocks = [];
const pieces = [];

function newLine() {
    document.body.appendChild(document.createElement("br"));
}

for (i = 0, k = 1; i < res; i++) {
    newLine();

    for (j = 0; j < res; j++) {
        const block = document.createElement("img");

        block.style.width = "128px";
        block.style.height = "128px";
        block.style.backgroundColor = "red";
        block.style.position = "absolute";
        block.style.left = String(128 * j) + "px";
        block.style.top = String(128 * i) + "px";

        block.occupied = false;
        block.num = k;
        const nm = document.createTextNode(String(block.num));
        block.appendChild(nm);

        blocks.push(block);
        document.body.appendChild(block);

        k++;
    }
}

newLine();

for (i = 0; i < res * res + 1; i++) {
    const piece = document.createElement("img");

    piece.style.width = "32px";
    piece.style.height = "32px";
    piece.style.backgroundColor = "rgb(" + String(i * 8) + "," + String(i * 12) + "," + String(i * 16) + ")";
    piece.style.position = "absolute";
    piece.style.left = String(32 * i) + "px";
    piece.style.top = "512px";

    piece.num = i + 1;
    const nm = document.createTextNode(String(piece.num));
    piece.appendChild(nm);

    pieces.push(piece);
    document.body.appendChild(piece);
}

pieces.forEach(piece => {
    piece.addEventListener("click", function() {
        piece.selected = true;

        for (i = 0; i < pieces.length; i++) {
            if (pieces[i] != piece) {
                pieces[i].selected = false;
            }
        }
    });
});

blocks.forEach(curBlock => {
    curBlock.addEventListener("click", function() {
        pieces.forEach(piece => {
            if (piece.selected && !curBlock.occupied) {
                curBlock.occupied = true;

                piece.style.left = curBlock.style.left;
                piece.style.top = curBlock.style.top;

                if (piece.num == curBlock.num) {
                    curBlock.style.backgroundColor = "green";
                }
            }
        });
    });
});