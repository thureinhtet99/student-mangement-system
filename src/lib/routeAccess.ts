export const ITEM_PER_PAGE = 20;

type RouteAccessMapType = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMapType = {
  "/": ["admin"],
  "/admin(.*)": ["admin"],
  "/teacher(.*)": ["teacher"],
  "/student(.*)": ["student"],
  "/parent(.*)": ["parent"],
  "/list/teachers(.*)": ["admin"],
  "/list/students(.*)": ["admin", "teacher"],
  "/list/parents(.*)": ["admin", "teacher"],
  "/list/classes(.*)": ["admin", "teacher"],
  "/list/subjects(.*)": ["admin"],
  "/list/lessons(.*)": ["admin", "teacher"],
  "/list/attendances(.*)": ["admin", "teacher", "student", "parent"],
  "/list/assignments(.*)": ["admin", "teacher", "student", "parent"],
  "/list/exams(.*)": ["admin", "teacher", "student", "parent"],
  "/list/results(.*)": ["admin", "teacher", "student", "parent"],
  "/list/events(.*)": ["admin", "teacher", "student", "parent"],
  "/list/announcements(.*)": ["admin", "teacher", "student", "parent"],
  // "/list/messages(.*)": ["admin", "teacher", "student", "parent"],
};
