<script lang="ts" setup></script>

<template>
  <div class="">
    <!--  <div class="bg-green-400">
    <div class="bg-red-300 h-100 section-clip-top">hej</div>
  </div>

  <div class="bg-green-300">
    <div class="bg-red-300 h-100 section-clip-2">hopp</div>
  </div>

  <div class="bg-green-600">
    <div class="bg-red-300 h-100 section-clip-poly">hopp</div>
  </div> -->

    <div class="bg-green-400">
      <div
        class="bg-red-300 section-animation flex flex-col justify-center items-center -mt-[50px] pt-[50px] pb-[50px]"
      >
        <div class="bg-black py-30 px-10">Middle</div>
      </div>
    </div>
    <div class="bg-green-400">
      <div
        class="bg-red-500 section-animation flex flex-col justify-center items-center -mt-[50px] pt-[50px] pb-[50px]"
      >
        <div class="bg-black py-30 px-10">Middle</div>
      </div>
    </div>
    <div class="bg-green-400">
      <div
        class="bg-red-200 section-animation flex flex-col justify-center items-center -mt-[50px] pt-[50px] pb-[50px]"
      >
        <div class="bg-black py-30 px-10">Middle</div>
      </div>
    </div>
     <div class="bg-green-400">
      <div
        class="bg-red-200 section-animation flex flex-col justify-center items-center -mt-[50px] pt-[50px] pb-[50px]"
      >
        <div class="bg-black py-30 px-10">Middle</div>
      </div>
    </div>

    <div class="h-40">ss</div>

    <div class="">
      <div
        class="bg-red-300 top-arrow-animation flex flex-col justify-center items-center  pt-[50px] pb-[100px]"
      >
        <div class="bg-black py-30 px-10">Middle</div>
      </div>
    </div>
    <div class="">
      <div
        class="bg-red-400 top-arrow-animation flex flex-col justify-center items-center -mt-[50px] pt-[50px] pb-[100px]"
      >
        <div class="bg-black py-30 px-10">Middle</div>
      </div>
    </div>
    <div class="">
      <div
        class="bg-default bg-linear-to-b from-amber-400 to-transparent top-arrow-animation flex flex-col justify-center items-center -mt-[50px] pt-[50px] pb-[50px]"
      >
        <div class="bg-black py-30 px-10">Middle</div>
      </div>
    </div>

    <WedgeSection
      class=" pb-[50px]"
      title="Wedge Section"
      description="This is a wedge section with clip-path."
      orientation="horizontal"
        :background-pattern="{
        src: 'assets/patterns/signal.svg',
        size: '200px',
      }"
      :reverse="false"
      wedge
    />
     <WedgeSection
      class="bg-default mt-[-50px] pb-[50px]"
      title="Wedge Section"
      description="This is a wedge section with clip-path."
      orientation="horizontal"
      :reverse="false"
      wedge
      :background-pattern="{
        src: 'assets/heroes/intinor-4-for-text.webp',
      
      }"
    >
  <!-- <template #top>
        <ShadVeroni
          :style="{
            maskImage:
              'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0))',
          }"
          class="absolute! top-0 h-full w-full -z-2"
        />
      </template> -->
  </WedgeSection>
     <WedgeSection
      class="bg-zinc-700 mt-[-50px]"
      title="Wedge Section"
      description="This is a wedge section with clip-path."
      orientation="horizontal"
      :reverse="false"
      wedge
    />

  </div>
</template>

<style>
.top-arrow-animation {
  --top-arrow-notch: 30px;

  animation: topArrowAnim;
  animation-timeline: view();
}

.top-arrow {
  clip-path: shape(
    from 0 0,
    line to calc(50% - var(--top-arrow-notch)) 0,
    arc by var(--top-arrow-notch) var(--top-arrow-notch) of var(--top-arrow-notch) cw,
    arc by var(--top-arrow-notch) calc(-1 * var(--top-arrow-notch)) of var(--top-arrow-notch) cw,
    line to 100% 0,
    line to 100% 100%,
    line to 0 100%,
    close
  );
}
@keyframes topArrowAnim {
  0% {
    clip-path: shape(
      from 0 0,
      line to 50% 0,
      arc by 0 0 of 0 cw,
      arc by 0 0 of 0 cw,
      line to 100% 0,
      line to 100% 100%,
      line to 0 100%,
      close
    );
    
  }
  50% {
    clip-path: shape(
      from 0 0,
      line to calc(50% - var(--top-arrow-notch)) 0,
      arc by var(--top-arrow-notch) var(--top-arrow-notch) of var(--top-arrow-notch) cw,
      arc by var(--top-arrow-notch) calc(-1 * var(--top-arrow-notch)) of var(--top-arrow-notch) cw,
      line to 100% 0,
      line to 100% 100%,
      line to 0 100%,
      close
    );
  }

  100% {
    clip-path: shape(
      from 0 0,
      line to 50% 0,
      arc by 0 0 of 0 cw,
      arc by 0 0 of 0 cw,
      line to 100% 0,
      line to 100% 100%,
      line to 0 100%,
      close
    );
    
  }
}


.section-clip-4 {
  clip-path: polygon(0 50px, 100% 0, 100% calc(100% - 50px), 0 100%);
}

.section-clip-4-inverted {
  clip-path: polygon(0 0, 100% 50px, 100% 100%, 0 calc(100% - 50px));
}

.section-animation {
  animation: clipPathAnim;
  animation-timeline: view();
}
@keyframes clipPathAnim {
  0% {
    clip-path: polygon(0 50px, 100% 0, 100% 100%, 0 100%);
  }
  50% {
    clip-path: polygon(0 0, 100% 50px, 100% 100%, 0 100%);
  }
  100% {
    clip-path: polygon(0 50px, 100% 0, 100% 100%, 0 100%);
  }
}

.section-clip-poly {
  clip-path: polygon(
    0% 20px,
    10% 20px,
    10% 50px,
    20% 50px,
    30% 50px,
    30% 0,
    40% 0,
    50% 0,
    50% 50px,
    60% 50px,
    70% 50px,
    70% 20px,
    80% 20px,
    90% 20px,
    90% 50px,
    100% 50px,
    100% 50%,
    0 50%,
    0 calc(100% - 50px),
    20% calc(100% + 20px - 50px),
    40% calc(100% + 50px - 50px),
    100% calc(100% + 20px - 50px),
    100% 50%,
    0 50%
  );
}
.section-clip-2 {
  clip-path: shape(
    from 0 0,
    line to 20% 20px,
    line to 40% 50px,
    line to 100% 20px,
    line to 100% 50%,
    line to 0 50%,
    close,
    move to 0 calc(100% - 50px),
    line to 20% calc(100% + 20px - 50px),
    line to 40% calc(100% + 50px - 50px),
    line to 100% calc(100% + 20px - 50px),
    line to 100% 50%,
    line to 0 50%,
    close
  );
}
.section-clip-top {
  clip-path: shape(
    from 0 0,
    smooth to 20% 31px with 10% 0px,
    smooth to 40% 33px with 30% 6px,
    smooth to 60% 32px with 50% 5px,
    smooth to 80% 40px with 70% 10px,
    smooth to 100% 21px with 90% 0px,
    line to 100% 50%,
    line to 0 50%,
    close,
    move to 0 calc(100% - 50px),
    smooth to 20% calc(100% + 31px - 50px) with 10% calc(100% + 0px - 50px),
    smooth to 40% calc(100% + 33px - 50px) with 30% calc(100% + 6px - 50px),
    smooth to 60% calc(100% + 32px - 50px) with 50% calc(100% + 5px - 50px),
    smooth to 80% calc(100% + 40px - 50px) with 70% calc(100% + 10px - 50px),
    smooth to 100% calc(100% + 21px - 50px) with 90% calc(100% + 0px - 50px),
    line to 100% 50%,
    line to 0 50%,
    close
  );
}
</style>
