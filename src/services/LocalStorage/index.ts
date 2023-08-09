export class LocalStorage {
    static setStorage(key: string, value: string | object): void {
        const data = JSON.stringify(value)
        localStorage.setItem(key, data)
    }

    static getStorage<T>(key: string): T | null {
        const data = localStorage.getItem(key)

        if (!data) {
            return null
        }

        return JSON.parse(data)

    }
}
