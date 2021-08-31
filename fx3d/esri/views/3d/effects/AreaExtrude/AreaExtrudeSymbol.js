/**
 * Copyright @ 2021 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/_base/declare","esri/core/promiseUtils"],function(e,r){var s=e(r["default"]||r.promiseUtils||r,{constructor:function(){this.symbol=symbol;for(var e=0,r=!1,s=function(s,t){t&&(this.childGraphics3DSymbols[s]=t,validSymbols++),e--,!this.isRejected()&&r&&e<1&&(validSymbols>0?this.resolve():this.reject())},t=0;t<numSymbolLayers;t++){var i=symbolLayers.getItemAt(t);if(i.enable!==!1){context.layerOrder=layerOrder+(1-(1+t)/numSymbolLayers),context.layerOrderDelta=1/numSymbolLayers;var l=Graphics3DSymbolLayerFactory.make(i,context,i._ignoreDrivers);l&&(e++,this.childGraphics3DSymbolPromises[t]=l,l.then(s.bind(this,t,l),s.bind(this,t,null)))}}context.layerOrder=layerOrder,r=!0,!this.isRejected()&&e<1&&(validSymbols>0?this.resolve():this.reject())},destroy:function(){this.isFulfilled()||this.reject()}});return s});