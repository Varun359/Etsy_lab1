import React, { useState, useEffect } from "react";
// import "./css/AddShopItem.css";
import { Cancel } from "@material-ui/icons";
import axios from "axios";
import { useCookies, CookiesProvider } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../variables";

function EditShopItem({ closeModal, setLoginStatus, item }) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cookie, setCookie] = useCookies(["cookie"]);
  const [updated, setUpdated] = useState(false);
  const navigate = useNavigate();
  const changeHandlerGeneric = (value, setterFunc, item_id) => {
    console.log(value);
    setterFunc(value);
  };
  useEffect(() => {
    console.log(item);
    setItemName(item.item_name);
    setCategory(item.item_category);
    setItemDesc(item.item_desc);
    setPrice(item.item_price);
    setQuantity(item.item_quantity);
  }, []);

  const submitForm = () => {
    console.log("hello");
    const user = localStorage.getItem("user");
    const data = {
      ...item,
      item_name: itemName,
      item_price: price,
      item_desc: itemDesc,
      item_category: category,
      item_quantity: quantity,
    };
    console.log(data);
    axios
      .post(`${BASE_URL}/editShopItem/${item.item_id}`, data, {
        headers: {
          "content-Type": "application/json",
          "auth-token": cookie.cookie.token,
        },
      })
      .then((response) => {
        console.log("Status Code : ", response.status);
        if (response.status === 200) {
          console.log(response);
          setUpdated(true);
          navigate("/shop/" + user.user_id);
        }
        closeModal();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div class="modal" id="editItemModel" role="dialog" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <form
          onSubmit={(e) => {
            submitForm();
          }}
        >
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">
                Edit Item Details
              </h5>
              <button
                type="button"
                class="close"
                onClick={closeModal}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="recipient-name" class="col-form-label">
                  Item Name:
                </label>
                <input
                  value={itemName}
                  onChange={(e) => {
                    changeHandlerGeneric(e.target.value, setItemName);
                  }}
                  type="text"
                  placeholder="Shop Name"
                  class="form-control"
                  id="shop-name"
                />
              </div>
              <div class="form-group">
                <label for="message-text" class="col-form-label">
                  Category:
                </label>
                <select
                  name="category"
                  value={category}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setCategory(e.target.value);
                  }}
                  className="custom-select"
                >
                  <option value="Clothing">Clothing</option>
                  <option value="Jewellery">Jewellery</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Home Decor">Home Decor</option>
                  <option value="Art">Art</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div class="form-group">
                <label for="message-text" class="col-form-label">
                  Item Description:
                </label>
                <textarea
                  class="form-control"
                  id="item_desc"
                  placeholder="Item Description"
                  rows="1"
                  cols="30"
                  value={itemDesc}
                  onChange={(e) => {
                    changeHandlerGeneric(e.target.value, setItemDesc);
                  }}
                ></textarea>
              </div>
              <div class="form-group">
                <label for="recipient-name" class="col-form-label">
                  Quantity:
                </label>
                <input
                  value={quantity}
                  onChange={(e) => {
                    changeHandlerGeneric(e.target.value, setQuantity);
                  }}
                  type="number"
                  class="form-control"
                  id="quantity"
                  min={0}
                />
              </div>
              <div class="form-group">
                <label for="recipient-name" class="col-form-label">
                  Price :
                </label>
                <input
                  value={price}
                  onChange={(e) => {
                    changeHandlerGeneric(e.target.value, setPrice);
                  }}
                  class="form-control"
                  id="price"
                  min={1}
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditShopItem;
