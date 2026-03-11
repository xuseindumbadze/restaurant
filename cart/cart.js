let images = [
  "../images/photo1.jpg",
  "../images/photo3.avif",
  "../images/photo4.avif",
];

let i = 0;

setInterval(() => {
  i++;
  if (i >= images.length) i = 0;
  document.getElementById("slider").src = images[i];
}, 3000);

const url = "https://restaurant.stepprojects.ge/api/Baskets/GetAll";

let basket = [];

async function getBasket() {
  const res = await fetch(url);

  basket = await res.json();

  renderBasket();
}

function renderBasket() {
  let html = "";

  let total = 0;

  basket.forEach((item) => {
    let itemTotal = item.product.price * item.quantity;

    total += itemTotal;

    html += `
<tr>

<td>
<img src="${item.product.image}" width="70">
${item.product.name}
</td>

<td>
<div class="qty">

<button onclick="changeQty(${item.product.id},-1)">-</button>

<span>${item.quantity}</span>

<button onclick="changeQty(${item.product.id},1)">+</button>

</div>
</td>

<td>$ ${item.product.price}</td>

<td>$ ${itemTotal.toFixed(2)}</td>

<td>
<button onclick="deleteItem(${item.product.id})">X</button>
</td>

</tr>
`;
  });

  document.getElementById("cartBody").innerHTML = html;

  document.getElementById("totalPrice").innerText = total.toFixed(2);
}

getBasket();

async function changeQty(id, value) {
  let product = basket.find((x) => x.product.id == id);

  if (!product) return;

  let newQty = product.quantity + value;

  if (newQty < 1) return;

  await fetch("https://restaurant.stepprojects.ge/api/Baskets/UpdateBasket", {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      productId: id,
      quantity: newQty,
    }),
  });

  getBasket();
}

async function deleteItem(id) {
  await fetch(
    `https://restaurant.stepprojects.ge/api/Baskets/DeleteProduct/${id}`,
    {
      method: "DELETE",
    },
  );

  getBasket();
}

async function clearBasket() {
  for (let item of basket) {
    await fetch(
      `https://restaurant.stepprojects.ge/api/Baskets/DeleteProduct/${item.product.id}`,
      {
        method: "DELETE",
      },
    );
  }

  getBasket();
}
