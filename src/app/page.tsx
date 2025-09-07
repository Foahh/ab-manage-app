"use client";

import { useEffect, useState } from "react";
import { PackManage } from "@/app/_page/pack/pack-manage";
import { SongManage } from "@/app/_page/song/song-manage";
import { SongerManage } from "@/app/_page/songer/songer-manage";
import { UserManage } from "@/app/_page/user/user-manage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCookie, setCookie } from "@/lib/cookie-util";

const LAST_TAB_COOKIE = "lastActiveTab";
const DEFAULT_TAB = "users";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_TAB);

  useEffect(() => {
    const savedTab = getCookie(LAST_TAB_COOKIE);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCookie(LAST_TAB_COOKIE, value);
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mx-2 mt-2">
          <TabsTrigger value="users">谱师管理</TabsTrigger>
          <TabsTrigger value="songs">歌曲管理</TabsTrigger>
          <TabsTrigger value="songers">选项管理</TabsTrigger>
          <TabsTrigger value="pack">打包</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManage />
        </TabsContent>
        <TabsContent value="songs">
          <SongManage />
        </TabsContent>
        <TabsContent value="songers">
          <SongerManage />
        </TabsContent>
        <TabsContent value="pack">
          <PackManage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
