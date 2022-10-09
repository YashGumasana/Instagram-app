import { GLOBALTYPES } from './globalTypes'
import { postDataAPI } from '../../utils/fetchData'
import valid from '../../utils/valid'


export const login = (data) => async (dispatch) => {
    try {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
        const res = await postDataAPI('auth/login', data);

        // console.log(res);
        // console.log(res.data);
        // console.log(res.data.user);
        // console.log(res.data.accessToken);
        dispatch({
            type: GLOBALTYPES.AUTH,
            payload: {
                token: res.data.access_token,
                user: res.data.user
            }
        })

        localStorage.setItem("firstLogin", true)
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {
                success: res.data.msg
            }
        })

    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {
                error: err.response.data.msg
            }
        })
    }
}


export const refreshToken = () => async (dispatch) => {
    const firstLogin = localStorage.getItem("firstLogin")
    if (firstLogin) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })

        try {
            console.log('refresh token');
            const res = await postDataAPI('auth/refresh_token')
            console.log(res);
            dispatch({
                type: GLOBALTYPES.AUTH,
                payload: {
                    token: res.data.access_token,
                    user: res.data.user
                }
            })

            dispatch({ type: GLOBALTYPES.ALERT, payload: {} })

        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: {
                    error: err.response.data.msg
                }
            })
        }
    }
}

export const register = (data) => async (dispatch) => {
    const check = valid(data)
    if (check.errLength > 0)
        return dispatch({ type: GLOBALTYPES.ALERT, payload: check.errMsg })

    try {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })

        const res = await postDataAPI('auth/register', data)
        // console.log(res);
        console.log(res.data);
        // console.log(res.data.user);
        console.log(res.data.access_token);
        dispatch({
            type: GLOBALTYPES.AUTH,
            payload: {
                token: res.data.access_token,
                user: res.data.user
            }
        })

        localStorage.setItem("firstLogin", true)
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {
                success: res.data.msg
            }
        })
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {
                error: err.response.data.msg
            }
        })
    }
}


export const logout = () => async (dispatch) => {
    try {
        localStorage.removeItem('firstLogin')
        await postDataAPI('auth/logout')
        window.location.href = "/"
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: {
                error: err.response.data.msg
            }
        })
    }
}