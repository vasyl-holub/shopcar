import { PageContainer } from "@/components/ui/page-container";
import { LoadingBlock } from "@/components/ui/loading-block";

export default function Loading() {
  return (
    <PageContainer className="mt-[30px] flex flex-col gap-[30px] lg:mt-10">
      <h1 className="text-h2 font-semibold leading-none text-black lg:text-h1 lg:leading-[1.2]">
        Результати пошуку
      </h1>
      <LoadingBlock label="Шукаємо…" />
    </PageContainer>
  );
}
