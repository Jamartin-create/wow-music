import nprogress from 'nprogress'
import { getCookie } from './auth'
import { useRouter } from 'vue-router'
import { useSystemTools } from '../hooks/useSystemTools'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

//配置进度条参数
nprogress.configure({ showSpinner: false, minimum: 0.2, easeing: 'swing', speed: 1000, trickleRate: 0.2 });

/**
 * 请求拦截器
 * @param config 
 * @returns 
 */
function requestInceptorsSuccess(config: AxiosRequestConfig) {
    config.headers?.isLoading == false || config.headers?.isLoading == null && nprogress.start();
    const params = config.params ? config.params : {}
    config.params = {
        ...params,
        cookie: `MUSIC_U=${getCookie("MUSIC_U")}`,
        timestamp: new Date().getTime()
    }
    return config
}

/**
 * 请求异常拦截器
 * @param error 
 * @returns 
 */
function requestInceptorsError(error: any) {
    nprogress.done();
    return Promise.reject(error.message)
}

/**
 * 响应成功拦截器
 * @param response 
 * @returns 
 */
function responseInceptorsSuccess(response: any) {
    nprogress.done();
    return response.data
}

/**
 * 响应失败拦截器
 * @param error 
 * @returns 
 */
function responseInceptorsError(error: any) {
    const { showMessage } = useSystemTools()
    const router = useRouter();
    nprogress.done();
    console.error(error);
    if (error.code === "ERR_NETWORK") {
        showMessage("网络异常，请检查网络后重试");
    }
    if (
        error.response &&
        typeof error.response.data === 'object' &&
        error.response.data.code === 301
    ) {
        showMessage("token已失效，请重新登录");
        router.push({ name: 'login' });
    }
    return Promise.reject(error);
}

const createAxiosInstance = (config?: AxiosRequestConfig): AxiosInstance => {
    //基础配置
    const instance = axios.create({
        baseURL: import.meta.env.VITE_RES_URL,
        timeout: 15000,
        withCredentials: true,
        ...config
    })

    //请求拦截器
    instance.interceptors.request.use(
        requestInceptorsSuccess as any,
        requestInceptorsError
    )

    //响应拦截器
    instance.interceptors.response.use(
        responseInceptorsSuccess,
        responseInceptorsError
    )

    return instance;
}

export default createAxiosInstance();