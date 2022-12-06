import axios, { AxiosInstance, AxiosError } from 'axios'
import * as controller from './marketmanController'
import { DateTime } from 'luxon'
import { app } from '../../config'
const { marketmanAPIKey, marketmanAPIPassword } = app

interface ErrorResponse {
    ErrorMessage: string
}

interface Token {
    _id: any
    token: string
    expireDate: string
    storeId: string
    merchantId: string
}

export class MarketmanApi {
    private url = 'https://api.marketman.com/v3'
    private api: AxiosInstance
    private token: Token | undefined
    // private apiKey = marketmanAPIKey
    // private apiPassword = marketmanAPIPassword

    constructor(private apiKey: string, private apiPassword: string) {
        this.api = axios.create({
            baseURL: this.url
        })
    }

    public async createToken(): Promise<any> {
        const resp = await this.api.post('/buyers/auth/GetToken', {
            APIKey: this.apiKey,
            APIPassword: this.apiPassword
        })

        if (resp.data.ErrorMessage) {
            throw new Error(resp.data.ErrorMessage)
        }

        return resp.data
    }

    // public async refreshTokenIfRequired(): Promise<void> {
    //     this.token = await controller.getMarketManToken(this.merchantId)

    //     console.log('current token', this.token)

    //     if (!this.token) {
    //         throw new Error('Marketman token missing')
    //     }

    //     const expireDate = DateTime.fromFormat(this.token.expireDate + ' utc', 'yyyy/MM/dd HH:mm:ss z')

    //     if (expireDate.diff(DateTime.local(), 'seconds').toObject().seconds || 0 < 500) {
    //         console.log('token expired')
    //         const resp = await this.createToken()

    //         this.token = await controller.updateMarketManToken(this.token._id, {
    //             token: resp.Token,
    //             expireDate: resp.ExpireDateUTC
    //         })
    //     }

    // }

    public async getAccounts(token: any): Promise<any> {
        try {
            this.token = token

            this.api = axios.create({
                baseURL: this.url,
                headers: {
                    AUTH_TOKEN: this.token
                }
            })
            //await this.refreshTokenIfRequired()

            //console.log('token refreshed')

            const resp = await this.api.post<any>('buyers/partneraccounts/GetAuthorisedAccounts')
            console.log(resp)
            if (resp.data.ErrorMessage) {
                throw new Error(resp.data.ErrorMessage)
            }
            return resp.data
        } catch (err) {
            console.log(err)
            throw this.newError(err)
        }
    }

    private newError(err: AxiosError<ErrorResponse>): Error {
        return new Error(err.response ? err.response.data.ErrorMessage : err.message)
    }
}
