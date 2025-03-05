import {ItemView, WorkspaceLeaf} from 'obsidian';
import type JugglPlugin from '../main';
import {Juggl} from './visualization';
import type {IDataStore, IJugglStores} from 'juggl-api';
import type {IJugglSettings} from 'juggl-api';
import {JUGGL_VIEW_TYPE} from "juggl-api";

export class JugglView extends ItemView {
     juggl: Juggl;
     constructor(leaf: WorkspaceLeaf, settings: IJugglSettings, plugin: JugglPlugin, initialNodes: string[]) {
       super(leaf);
       // TODO: Maybe make this configurable
       leaf.setPinned(true);
       const coreStore = plugin.coreStores[settings.coreStore];
       const stores: IJugglStores ={
         dataStores: [coreStore as IDataStore].concat(plugin.stores),
         coreStore: coreStore};
       this.juggl = new Juggl(this.containerEl.children[1], plugin, stores, settings, initialNodes);
       this.addChild(this.juggl);
     }

     getDisplayText(): string {
       // TODO: Make this interactive: Either the active workspace or the local graph
       return 'Juggl';
     }

     getViewType(): string {
       return JUGGL_VIEW_TYPE;
     }

     async onClose(): Promise<void> {
       // 防止循环引用和重复清理
       if (!this.juggl) return Promise.resolve();
       
       try {
         // 保存引用并立即移除
         const juggl = this.juggl;
         this.juggl = null;
         
         // 执行juggl实例的卸载方法
         juggl.onunload();
         
         // 从组件树中移除
         this.removeChild(juggl);
         
         // 彻底清理DOM元素
         if (this.containerEl) {
           try {
             // 安全移除所有子元素
             const children = Array.from(this.containerEl.children);
             children.forEach(child => {
               try {
                 child.remove();
               } catch (e) {
                 console.error("移除DOM子元素失败", e);
               }
             });
           } catch (e) {
             console.error("DOM清理失败", e);
           }
         }
       } catch (e) {
         console.error("视图关闭过程失败", e);
       }
       
       return Promise.resolve();
     }
}
