import React, {useCallback, useEffect, useState} from 'react';
import './Form.css';
import {useTelegram} from "../../hooks/useTelegram";
import ReactInputMask from 'react-input-mask';

const Form = () => {
    const [surname, setSurname] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const {tg, queryId} = useTelegram();

    const onSendData = useCallback(() => {
        const data = {
            queryId,
            surname,
            name,
            phone,
            email,
        }
        fetch('http://localhost:3001/web-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
    }, [surname, name, phone, email])

    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData)
        return () => {
            tg.offEvent('mainButtonClicked', onSendData)
        }
    }, [onSendData])

    useEffect(() => {
        tg.MainButton.setParams({
            text: 'Отправить данные'
        })
    }, [])

    useEffect(() => {
        if(!surname || !name || !phone || !email) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
        } 
    }, [surname, name, phone, email])

    const onChangeSurname = (e) => {
        setSurname(e.target.value)
    }

    const onChangeName = (e) => {
        setName(e.target.value)
    }

    const onChangePhone = (e) => {
        setPhone(e.target.value)
    }

    const onChangeEmail = (e) => {
        setEmail(e.target.value)
    }
    
    return (
        <div className={"form"}>
            <h3>Введите ваши данные</h3>
            <input
                className={'input'}
                type="text"
                placeholder={'Фамилия'}
                value={surname}
                onChange={onChangeSurname}
            />
            <input
                className={'input'}
                type="text"
                placeholder={'Имя'}
                value={name}
                onChange={onChangeName}
            />
            <ReactInputMask
                mask='+7-999-999-99-99' 
                id={'phone'}
                className={'input'}
                type="tel"
                placeholder={'Телефон'}
                value={phone}
                onChange={onChangePhone}
            />
            <input
                className={'input'} 
                type="email"
                placeholder={'Email'}
                value={email}
                onChange={onChangeEmail}
            />
        </div>
    );
};

export default Form;
