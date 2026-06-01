index.html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>나의 아이디어 창고</title>
    <style>
        body { font-family: sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        input, textarea { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .card-list { margin-top: 20px; display: grid; grid-template-columns: 1fr; gap: 15px; }
        .card { background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .card h3 { margin: 0 0 10px 0; color: #333; }
        .card p { margin: 0; color: #666; }
    </style>
</head>
<body>

<div class="container">
    <h2>새로운 아이디어 추가</h2>
    <input type="text" id="titleInput" placeholder="제목을 입력하세요">
    <textarea id="descInput" rows="3" placeholder="내용을 입력하세요"></textarea>
    <button onclick="addCard()">카드 추가하기</button>

    <div class="card-list" id="cardList">
        </div>
</div>

<script>
    function addCard() {
        const title = document.getElementById('titleInput').value;
        const desc = document.getElementById('descInput').value;

        if (!title || !desc) {
            alert('제목과 내용을 모두 입력해주세요!');
            return;
        }

        // 카드 생성
        const cardList = document.getElementById('cardList');
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${title}</h3><p>${desc}</p>`;

        // 목록에 추가
        cardList.appendChild(card);

        // 입력창 비우기
        document.getElementById('titleInput').value = '';
        document.getElementById('descInput').value = '';
    }
</script>

</body>
</html>
