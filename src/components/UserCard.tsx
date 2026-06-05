import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, User, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  const data = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const userCount = await (data[type] as any).count();

  const iconMap = {
    admin: UserCheck,
    teacher: GraduationCap,
    student: User,
    parent: Users,
  };

  const IconComponent = iconMap[type];

  return (
    <Card className="flex-1 min-w-[180px] bg-white">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div className="p-2 bg-muted rounded-full">
          <IconComponent className="h-5 w-5 text-muted-foreground" />
        </div>
        <Badge
          variant="outline"
          className="rounded-full px-3 py-1 text-xs font-medium"
        >
          {new Date().getFullYear()} /{" "}
          {(new Date().getFullYear() + 1).toString().slice(2)}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground capitalize tracking-wide">
            {type === "admin" ? "Administrators" : `${type}s`}
          </p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {userCount.toLocaleString()}
          </h1>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
