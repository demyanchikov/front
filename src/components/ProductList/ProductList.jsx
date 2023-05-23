import React, {useState} from 'react';
import './ProductList.css';
import ProductItem from "../ProductItem/ProductItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";
import { useNavigate } from "react-router-dom";

const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc += +item.price
    }, 0)
}

const ProductList = () => {
    const [addedItems, setAddedItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [inputSearch, setInputSearch] = useState('');
    const {tg, queryId, user} = useTelegram();
    const navigate = useNavigate();

    async function fetchProducts() {
        let res = await fetch('http://localhost:3001/products', {
            headers: {
                'Content-type': 'application/json',
            }
        });
        res = await res.json();
        setProducts(res.products);
        setFilteredProducts([...res.products]);
    }
    async function fetchCategories() {
        let res = await fetch('http://localhost:3001/categories', {
            headers: {
                'Content-type': 'application/json',
            }
        });
        res = await res.json();
        setCategories(res.categories);
    }

    async function onSearch(evt) {
        evt.preventDefault();        
        setFilteredProducts(products.filter(p=>p.nomination.toLowerCase().includes(inputSearch.toLocaleLowerCase())));
    }

    useEffect(() => {       
        fetchProducts();
        fetchCategories();
    }, [])

    const onSendData = useCallback(() => {
        const data = {
            products: addedItems,
            totalPrice: getTotalPrice(addedItems),
            queryId,
        }
        fetch('http://localhost:3001/web-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        navigate(`/form`)
    }, [addedItems])

    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData)
        return () => {
            tg.offEvent('mainButtonClicked', onSendData)
        }
    }, [onSendData])

    const onAdd = (product) => {
        const alreadyAdded = addedItems.find(item => item.id === product.id);
        let newItems = [];

        if(alreadyAdded) {
            newItems = addedItems.filter(item => item.id !== product.id);
        } else {
            newItems = [...addedItems, product];
        }

        setAddedItems(newItems)

        if(newItems.length === 0) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
            tg.MainButton.setParams({
                text: `Купить ${getTotalPrice(newItems)} руб.`
            })

        }
    }

    async function onClickCategory(category) {
        let res = await fetch('http://localhost:3001/productsCategory' +
        `?categoryId=${category.id}`, {
            headers: {
                'Content-type': 'application/json',
            }
        });
        res = await res.json();
        setProducts(res.products);
        setFilteredProducts([...res.products]);
    }

    return (
        <>
            <form className='search' action="" onSubmit={onSearch}>
                <label className='menu' htmlFor="inburger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fillRule="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                </label>
                    <input type="checkbox" name="" id="inburger" />
                    <div className='burger'>
                        <label className='menuCat' htmlFor="inburger">
                            <svg className='menuCat' xmlns="http://www.w3.org/2000/svg" width="32" height="32" fillRule="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                            </svg>
                        </label>
                        <div className='cursor' onClick={fetchProducts}>
                            Главная
                        </div>
                        {categories.map(category => (
                            <div className='cursor' onClick={() => onClickCategory(category)} >
                                {category.nomination}
                            </div>
                        ))}
                    </div>
                    <input className='searchInput'
                           placeholder='Я ищу...'
                           type="text"
                           onChange={e => {setInputSearch(e.target.value)}}
                           value={inputSearch}/>
                    <button className='seacrhing' type="submit"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fillRule="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                            </svg>
                    </button>    
            </form>
            <div className={'list'}>
                {filteredProducts.map(item => (                    
                    <ProductItem
                        product={item}
                        onAdd={onAdd}
                        className={'item'}
                        key={item.id}
                    />
                ))}
            </div>
        </>
    );
};

export default ProductList;

