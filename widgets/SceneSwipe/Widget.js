///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define(['dojo/_base/declare', 'jimu/BaseWidget', "dojo/dom", "dojo/dom-style", "dojo/dom-construct", "esri/WebScene",
  "esri/views/SceneView", "dojo/on", "dojo/_base/lang", "esri/core/watchUtils", "esri/widgets/LayerList"],
function(declare, BaseWidget, dom, domStyle, domConstruct, WebScene, SceneView, on, lang, watchUtils, LayerList) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    //Please note that the widget depends on the 4.0 API

    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,

    baseClass: 'jimu-widget-sceneSwipe',
    containerNode: null,
    node: null,
    swipe: null,
    positionHandler: null,
    swipeView: null,
    layerListNode: null,

    postCreate: function() {
      this.inherited(arguments);
      console.log('postCreate');
    },

    startup: function() {
      this.inherited(arguments);
      console.log('startup');
    },

    onOpen: function(){
      console.log('onOpen');
      let me = this;

      if (this.containerNode) {
        domConstruct.destroy(this.containerNode);
      }
      var parentNode = dom.byId(jimuConfig.layoutId);

      this.containerNode = domConstruct.create("div", {
        "class": "jimu-widget-sceneSwipe",
        "id": "containerTop"
      }, parentNode);

      this.node = domConstruct.create("div", {
        "class": "jimu-sceneView"
      }, this.containerNode);

      this.layerListNode = domConstruct.create("div", {
        "class": "jimu-swipe-layerList"
      }, this.containerNode, "first");

      var webScene = new WebScene({
        portalItem: {
          id: this.config.itemId
        }
      });

      this.swipeView = new SceneView({
        container: this.node,
        map: webScene,
        environment: {
          lighting: {
            directShadowsEnabled: true,
            ambientOcclusionEnabled: false
          }
        }
      });

      this.swipeView.extent = this.sceneView.extent;
      this.swipeView.viewpoint = this.sceneView.viewpoint;

      this.__createSwipe();
      this.swipeView.when(() => {
        this.syncViews(this.sceneView, this.swipeView);

        let layerList = new LayerList({
          view: this.swipeView,
          container: this.layerListNode
        });
      });
    },

    __createSwipe: function () {
      if (this.swipe) {
        domConstruct.destroy(this.swipe);
      }
      var parentNode = dom.byId(jimuConfig.layoutId);
      this.swipe = domConstruct.create("div", {
        "id": "swipe"
      }, parentNode);

      var swipeImage = domConstruct.create("img", {
        "src": "./images/swipe-symbol.png",
        "alt": "swipe symbol"
      }, this.swipe);

      domStyle.set(this.node, "width", domStyle.get(parentNode, "width")+ "px")

      this.own(on(this.swipe, "pointerdown", lang.hitch(this, this.pointerDown)));
      this.own(on(this.swipe, "pointerup", lang.hitch(this, this.pointerUp)))
    },

    pointerDown: function(evt) {
      evt.preventDefault();
      if (!this.positionHandler) {
        this.positionHandler = on(document, "pointermove", lang.hitch(this, this.positionChanged));
      }
    },

    pointerUp: function(evt) {
      if (this.positionHandler) {
        this.positionHandler.remove();
        this.positionHandler = null;
      }
    },

    positionChanged: function(evt) {
      evt.preventDefault();
      var mainMapNode = dom.byId(this.appConfig.map.id);

      if (evt.clientX && (evt.clientX < domStyle.get(mainMapNode, "width") - 30) && (evt.clientX > 30)) {
        this.changeSwipePosition(evt.clientX);
        domStyle.set(this.containerNode, "right", domStyle.get(mainMapNode, "width") - evt.clientX + "px");
      }
    },

    changeSwipePosition: function(positionX) {
      domStyle.set(this.swipe, "left", positionX + "px");
    },

    syncViews: function(view1, view2) {
      this._syncViews(view1, view2);
      this._syncViews(view2, view1);
    },

    _syncViews: function(view1, view2) {
      let viewpointWatchHandle = null;
      let interactWatcher = null;
      let scheduleId = null;

      function clear() {
        viewpointWatchHandle && viewpointWatchHandle.remove();
        viewStationaryHandle && viewStationaryHandle.remove();
        scheduleId && clearTimeout(scheduleId);
        viewpointWatchHandle = viewStationaryHandle = scheduleId = null;
      }

      interactWatcher = view1.watch('interacting,animation', function(newValue) {
        if (!newValue) {
          return;
        }
  
        if (viewpointWatchHandle || scheduleId) {
          return;
        }
  
        scheduleId = setTimeout(function() {
          scheduleId = null;
          viewpointWatchHandle = view1.watch('viewpoint',
            function(newValue) {
              view2.viewpoint = newValue;
            });
        }, 0);
  
        viewStationaryHandle = watchUtils.whenTrue(view1,
          'stationary', clear);
      });
    },

    onClose: function(){
      console.log('onClose');
      if (this.containerNode) {
        domConstruct.destroy(this.containerNode);
        this.containerNode = null;
      }

      if (this.swipe) {
        domConstruct.destroy(this.swipe);
        this.swipe = null;
      }

      if (this.swipeView) {
        this.swipeView.destroy();
      }
    },

    onMinimize: function(){
      console.log('onMinimize');
    },

    onMaximize: function(){
      console.log('onMaximize');
    }
  });
});