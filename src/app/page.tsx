"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { DesignerManage } from "@/components/page/designer/designer-manage";
import { PackManage } from "@/components/page/pack/pack-manage";
import { SongManage } from "@/components/page/song/song-manage";
import { UserManage } from "@/components/page/user/user-manage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LAST_TAB_COOKIE = "lastActiveTab";
const DEFAULT_TAB = "users";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_TAB);

  useEffect(() => {
    const savedTab = Cookies.get(LAST_TAB_COOKIE);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    Cookies.set(LAST_TAB_COOKIE, value);
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="users">谱师管理</TabsTrigger>
          <TabsTrigger value="songs">歌曲管理</TabsTrigger>
          <TabsTrigger value="designers">选项管理</TabsTrigger>
          <TabsTrigger value="pack">打包</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManage />
        </TabsContent>
        <TabsContent value="songs">
          <SongManage />
        </TabsContent>
        <TabsContent value="designers">
          <DesignerManage />
        </TabsContent>
        <TabsContent value="pack">
          <PackManage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
