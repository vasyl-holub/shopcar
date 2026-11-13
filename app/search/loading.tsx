import { PageContainer } from "@/components/ui/page-container";
import { LoadingBlock } from "@/components/ui/loading-block";

export default function Loading() {
  return (
    <PageContainer className="flex flex-col gap-5 pb-5 lg:mt-10">
      <h1 className="text-h2 font-semibold leading-none text-black lg:text-h1 lg:leading-[1.2]">
        Пошук
      </h1>
      <LoadingBlock label="Шукаємо…" />
    </PageContainer>
  );
}
