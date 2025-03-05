import type {IAGMode} from 'juggl-api';
import type {EventNames, EventObject, NodeSingular} from 'cytoscape';
import type {Juggl} from './visualization';
import type {NodeCollection} from 'cytoscape';
import type {Menu} from 'obsidian';
import ToolbarLocal from '../ui/toolbar/ToolbarLocal.svelte';
import {Component, TFile} from 'obsidian';
import {VizId} from 'juggl-api';
import {
  CLASS_ACTIVE_NODE,
  CLASS_CONNECTED_ACTIVE_NODE,
  CLASS_INACTIVE_NODE,
  CLASS_EXPANDED,
} from '../constants';
import type {Core} from 'cytoscape';
import type {SvelteComponent} from 'svelte';
import {
  getLayoutSetting,
} from './layout-settings';
import {Logger} from '../logger';
import {GraphStyleSheet} from './stylesheet';


class EventRec {
    eventName: EventNames;
    selector: string;
    event: any;
}

export class LocalMode extends Component implements IAGMode {
    view;
    viz: Core;
    events: EventRec[] = [];
    windowEvent: any;
    toolbar: SvelteComponent;
    depth: number = 1;
    maxDepthForCurrentFile: number = 1;

    constructor(view: Juggl) {
      super();
      this.view = view;
    }


    onload() {
      if (this.view.vizReady) {
        this._onLoad();
      } else {
        this.registerEvent(this.view.on('vizReady', (viz) => {
          this._onLoad();
        }));
      }
    }

    _onLoad() {
      this.viz = this.view.viz;
      this.registerCyEvent('tap', 'node', async (e: EventObject) => {
        const file = await this.view.plugin.openFileFromNode(e.target, e.originalEvent.metaKey);
        if (file) {
          await this.onOpenFile(file);
        }
      });

      // Register on file open event
      this.registerEvent(this.view.workspace.on('file-open', async (file) => {
        if (file) {
          await this.onOpenFile(file);
        }
      }));
    }

    async onOpenFile(file: TFile) {
      if (!this.view.settings.autoAddNodes) {
        return;
      }
      
      const id = new VizId(file.name, 'core');
      let node;
      
      // 开始批处理以提高性能
      this.viz.startBatch();
      
      // 检查节点是否已存在
      if (this.viz.$id(id.toId()).length === 0) {
        // 节点不存在，创建新节点
        const store = this.view.datastores.coreStore;
        node = await store.get(id, this.view);
        if (node) {
          this.viz.add(node);
        }
      } else {
        // 节点已存在
        node = this.viz.$id(id.toId());
      }
      
      // 更新活动节点
      if (node) {
        // 移除之前的活动节点标记
        this.viz.$(`.${CLASS_ACTIVE_NODE}`).removeClass(CLASS_ACTIVE_NODE);
        
        // 标记新的活动节点
        node.addClass(CLASS_ACTIVE_NODE);
        
        // 重新应用本地样式
        this.reapplyLocalStyles(node);
        
        // 如果设置了自动展开，则展开节点
        if (this.view.settings.autoExpand) {
          await this.view.expand(node);
        }
      }
      
      // 结束批处理并更新视图
      this.viz.endBatch();
      this.viz.style().update();
    }

    // 添加重新应用本地样式的方法
    private reapplyLocalStyles(node: NodeSingular) {
      try {
        const logger = Logger.getInstance();
        logger.debug(`重新应用本地样式到节点: ${node.id()}`);
        
        // 获取样式表
        const styleSheet = new GraphStyleSheet(this.view.plugin);
        
        // 更新样式
        this.view.viz.style(styleSheet.getDefaultStylesheet());
        
        // 应用样式组
        const styleGroups = this.view.settings.localStyleGroups || 
                            this.view.settings.globalStyleGroups;
        
        if (styleGroups && styleGroups.length > 0) {
          // 应用样式组
          const styleGroupSheet = styleSheet.styleGroupsToSheet(styleGroups, 'local');
          this.view.viz.style().fromString(styleGroupSheet).update();
        }
        
        // 更新视图
        this.view.viz.style().update();
      } catch (error) {
        Logger.getInstance().error(`应用本地样式时出错: ${error}`);
      }
    }

    changeDepth(depth: number) {
        console.log(`changing depth to ${depth}`);

    }

    registerCyEvent(name: EventNames, selector: string, callback: any) {
      this.events.push({eventName: name, selector: selector, event: callback});
      if (selector) {
        this.viz.on(name, selector, callback);
      } else {
        this.viz.on(name, callback);
      }
    }

    onunload(): void {
      // 清理事件监听器
      for (const listener of this.events) {
        try {
          if (listener.selector) {
            this.viz.off(listener.eventName, listener.selector, listener.event);
          } else {
            this.viz.off(listener.eventName, listener.event);
          }
        } catch (e) {
          console.error("事件监听器移除失败", e);
        }
      }
      this.events = [];
      
      // 清理窗口事件监听器
      if (this.windowEvent) {
        try {
          const doc = window.document;
          if (doc && doc.removeEventListener) {
            doc.removeEventListener('keydown', this.windowEvent);
          }
          this.windowEvent = null;
        } catch (e) {
          console.error("窗口事件监听器移除失败", e);
        }
      }
      
      // 销毁toolbar组件
      if (this.toolbar && typeof this.toolbar.$destroy === 'function') {
        try {
          this.toolbar.$destroy();
          this.toolbar = undefined;
        } catch (e) {
          console.error("Toolbar组件销毁失败", e);
        }
      }
      
      // 清理DOM元素
      try {
        const element = document.querySelector('.toolbar-container');
        if (element) {
          element.innerHTML = '';
        }
      } catch (e) {
        console.error("DOM清理失败", e);
      }
    }

    getName(): string {
      return 'local';
    }

    fillMenu(menu: Menu, nodes: NodeCollection): void {

    }

    createToolbar(element: Element) {
      const view = this.view;
      this.toolbar = new ToolbarLocal({
        target: element,
        props: {
          viz: this.viz,
          fitClick: this.view.fitView.bind(view),
          fdgdClick: () => this.view.setLayout(getLayoutSetting('force-directed', this.view.settings)),
          concentricClick: () => this.view.setLayout(getLayoutSetting('circle')),
          gridClick: () => this.view.setLayout(getLayoutSetting('grid')),
          hierarchyClick: () => this.view.setLayout(getLayoutSetting('hierarchy')),
          workspaceModeClick: () => view.setMode('workspace'),
          filterInput: (handler: InputEvent) => {
            // @ts-ignore
            this.view.searchFilter(handler.target.value);
            this.view.restartLayout();
          },
          onDepthChange: this.changeDepth,
          filterValue: this.view.settings.filter,
          workspace: this.view.plugin.app.workspace,
        },
      });
    }

    updateActiveFile(node: NodeCollection) {
      this.viz.elements()
          .removeClass([CLASS_CONNECTED_ACTIVE_NODE, CLASS_ACTIVE_NODE, CLASS_INACTIVE_NODE])
          .difference(node.closedNeighborhood())
          .addClass(CLASS_INACTIVE_NODE);
      node.addClass(CLASS_ACTIVE_NODE);
      node.connectedEdges()
          .addClass(CLASS_CONNECTED_ACTIVE_NODE)
          .connectedNodes()
          .addClass(CLASS_CONNECTED_ACTIVE_NODE)
          .union(node);
    }
}
