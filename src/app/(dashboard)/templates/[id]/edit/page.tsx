"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateForm } from "@/components/templates/template-form";
import { useTemplate } from "@/hooks/use-templates";

export default function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useTemplate(id);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] rounded-lg" />
      </div>
    );
  }

  if (!data?.template) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Template not found</p>
        <Button asChild className="mt-4">
          <Link href="/templates">Back to Templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" asChild>
        <Link href={`/templates/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Template
        </Link>
      </Button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
        <p className="text-muted-foreground">Update your workout template.</p>
      </div>
      <TemplateForm initialData={data.template} mode="edit" />
    </div>
  );
}
