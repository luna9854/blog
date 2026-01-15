"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function IntroduceContent() {
  return (
    <Accordion>
      <AccordionItem id="who-we-are-accordion" value="who-we-are">
        <AccordionTrigger className="text-lg font-mono">
          Who we are, for now
        </AccordionTrigger>
        <AccordionContent className="text-zinc-300 leading-relaxed font-light border-t border-zinc-800 mt-4 pt-4">
          <p>
            저희는 수치로 증명되는 결과와, 틀에 박힌 기준에 지쳐 있습니다.
          </p>
          <p>
            정해진 템플릿에 나를 맞추지 않으면 살아가기 어려운 환경에도
            질문을 던지고 싶습니다. 그래서 저희는, 스스로에게 솔직해질 수
            있는 환경을 만들고자 합니다.
          </p>
          <p>이곳은 무언가를 이미 정한 사람들이 모인 집단이 아닙니다.</p>
          <p>
            우리는 아직 무엇을 좋아하는지, 어떤 방식으로 살아가고 싶은지,
            어떤 작업을 계속하고 싶은지를 알아가는 중에 있습니다. 이
            집단의 목적은 하나의 목표를 달성하는 것이 아니라, 각자가
            자신만의 감각을 찾고 그 감각을 오래 탐구할 수 있도록 곁에
            사람이 있는 상태를 만드는 데 있습니다.
          </p>
          <p>
            각자는 혼자서도 작업할 수 있고, 자기만의 길을 걸을 수
            있습니다.
          </p>
          <p>
            하지만 혼자서는 불안해지기 쉽고, 스스로를 의심하다 멈추게
            되기도 합니다. 우리는 같은 길을 가기 위해 모인 것이 아니라, 내
            주변에도 나처럼 자기만의 길을 걷는 사람이 있다는 감각을
            유지하기 위해 함께합니다.
          </p>
          <p>
            우리는 서로를 이끌지 않고, 앞서거나 뒤처졌다고 판단하지
            않습니다.
          </p>
          <p>
            미완성, 탐색 중, 멈춤 또한 자연스러운 과정으로 존중합니다.
          </p>
          <p>이곳은 전시장이면서 연습실이고, 기록의 공간입니다.</p>
          <p>우리는 같은 길을 걷지 않지만, 혼자 걷지도 않습니다.</p>
          <p>
            각자가 자기 속도로 오래 걸어갈 수 있도록, 서로의 존재를
            확인하는 자리입니다.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
