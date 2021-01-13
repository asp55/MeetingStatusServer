export default class PersistantWebSocket extends EventTarget {
    constructor(url, protocols=[]) {
        super();
        this._url = url;
        this._protocols = [];
        this._persist = true;

        this.onclose = function(){};
        this.onerror = function(){};
        this.onmessage = function(){};
        this.onopen = function(){};

        this.start();
    }

    start() {
        this._connection = new WebSocket(this._url, this._protocols);
        if(typeof this._binaryType !== "undefined") this._connection.binaryType = this._binaryType;

        const _onopen = (event) => {
            const {type, bubbles, cancelable, composed} = event;
            const relayOpenEvent = new Event(type, {bubbles: bubbles, cancelable: cancelable, composed: composed});
            this.dispatchEvent(relayOpenEvent);
            this.onopen(relayOpenEvent)
        }

        const _onmessage = (messageEvent) => {
            const {type, bubbles, cancelable, composed, data, origin, lastEventId, source, ports} = messageEvent;
            const relayMessageEvent = new MessageEvent(type, {bubbles: bubbles, cancelable: cancelable, composed: composed, data: data, origin: origin, lastEventId: lastEventId, source: source, ports: ports});
            this.dispatchEvent(relayMessageEvent);
            this.onmessage(relayMessageEvent);
        }

        const _onclose = (closeEvent)=>{
            if(this._persist) {
                this._connection = null;
                setTimeout(()=>{if(this._persist) this.start()}, 500);
            }

            const {type, bubbles, cancelable, composed, wasClean, code, reason} = closeEvent;

            const relayCloseEvent = new CloseEvent("close", {bubbles: bubbles, cancelable: cancelable, composed: composed, wasClean: wasClean, code:code, reason:reason});
            this.dispatchEvent(relayCloseEvent);
            this.onclose(relayCloseEvent);
        }

        const _onerror = (event) => {
            const {type, bubbles, cancelable, composed} = event;
            const relayErrorEvent = new Event(type, {bubbles: bubbles, cancelable: cancelable, composed: composed});
            
            this.dispatchEvent(relayErrorEvent);
            this.onerror(relayErrorEvent)
        }

        this._connection.addEventListener("open", _onopen);
        this._connection.addEventListener("close", _onclose);
        this._connection.addEventListener("message", _onmessage);
        this._connection.addEventListener("error", _onerror);

    }

    stop() {
        this._persist = false;
        this._connection.close();
    }

    send(data) {
        try {
            this._connection.send(data);
        }
        catch(err) {
            throw(err);
        }
    }

    get binaryType() {
        return this._connection.binaryType;
    }
    
    set binaryType(type) {
        this._binaryType = type;
        this._connection.binaryType = type;
    }
    
    get bufferedAmount() {
        return this._connection.bufferedAmount;
    }
    
    get extensions() {
        return this._connection.extensions;
    }
    
    get protocol() {
        return this._connection.protocol;
    }

    get readyState() {
        if(this._connection.readyState===3 && this._persist) return 4;
        else return this._connection.readyState;
    }
    
    get url() {
        return this._connection.url;
    }
}
