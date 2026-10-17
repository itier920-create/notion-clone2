import { FiChevronsLeft, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Item from "./Item";
import { useAtom } from "jotai";
import { currentUserAtom } from "../../modules/auth/current-user.state";
import { useTheme } from "../../modules/theme/theme.state";

export default function UserItem() {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const { theme, toggleTheme } = useTheme();

  const signout = async () => {
    setCurrentUser(undefined);
    localStorage.removeItem("token");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="user-item-trigger" role="button">
          <div className="user-item-info">
            <span className="user-item-name">
              {currentUser!.name} さんのノート
            </span>
          </div>
          <FiChevronsLeft className="user-item-chevron" size={16} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="user-item-dropdown"
        align="start"
        alignOffset={11}
        forceMount
      >
        <div className="user-item-dropdown-content">
          <p className="user-item-email">{currentUser!.email}</p>
          <div className="user-item-info">
            <div>
              <p className="user-item-name-display">{currentUser!.name}</p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="user-item-theme-toggle">
          {/* 今と逆のモード(切り替え先)を表示する */}
          <Item
            label={theme === "dark" ? "ライトモード" : "ダークモード"}
            icon={theme === "dark" ? FiSun : FiMoon}
            onClick={toggleTheme}
          />
        </DropdownMenuItem>
        <DropdownMenuItem className="user-item-logout">
          <Item label="ログアウト" icon={FiLogOut} onClick={signout} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
