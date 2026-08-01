type BeeExpression = 'cheer' | 'proud' | 'sad' | 'tired'

interface BeeMascotProps {
  expression: BeeExpression
  size?: number
  className?: string
}

function ExpressionCheer() {
  return (
    <g id="expression-cheer">
      <g id="eyes-cheer">
        <path
          d="M320 702C335 681 365 681 380 702"
          stroke="#342015"
          strokeWidth="17"
          strokeLinecap="round"
        />
        <path
          d="M448 702C463 681 493 681 508 702"
          stroke="#342015"
          strokeWidth="17"
          strokeLinecap="round"
        />
      </g>
      <g id="cheeks-cheer">
        <ellipse cx="306" cy="752" rx="27" ry="15" fill="#ED8D72" fillOpacity=".45" />
        <ellipse cx="522" cy="752" rx="27" ry="15" fill="#ED8D72" fillOpacity=".45" />
      </g>
      <g id="mouth-cheer">
        <ellipse cx="414" cy="773" rx="36" ry="40" fill="#3A2015" />
        <path d="M391 790C403 806 425 808 438 791C424 784 405 784 391 790Z" fill="#E88875" />
      </g>
    </g>
  )
}

function ExpressionProud() {
  return (
    <g id="expression-proud">
      <g id="eyes-proud">
        <path
          d="M319 696C337 713 362 713 381 696"
          stroke="#342015"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M448 696C466 713 491 713 510 696"
          stroke="#342015"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </g>
      <g id="cheeks-proud">
        <ellipse cx="307" cy="751" rx="25" ry="14" fill="#ED8D72" fillOpacity=".38" />
        <ellipse cx="521" cy="751" rx="25" ry="14" fill="#ED8D72" fillOpacity=".38" />
      </g>
      <path
        id="mouth-proud"
        d="M385 760C399 781 425 781 440 760"
        stroke="#2E190F"
        strokeWidth="16"
        strokeLinecap="round"
      />
    </g>
  )
}

function ExpressionSad() {
  return (
    <g id="expression-sad">
      <g id="eye-left">
        <ellipse cx="350" cy="697" rx="31" ry="35" fill="url(#face-brown)" />
        <ellipse cx="340" cy="686" rx="8" ry="10" fill="#C9A17D" fillOpacity=".28" />
      </g>
      <g id="eye-right">
        <ellipse cx="478" cy="697" rx="31" ry="35" fill="url(#face-brown)" />
        <ellipse cx="468" cy="686" rx="8" ry="10" fill="#C9A17D" fillOpacity=".28" />
      </g>
      <g id="mouth-sad">
        <path
          d="M385 786C399 765 425 765 440 786"
          stroke="#2E190F"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </g>
      <path
        id="tear"
        d="M515 724C533 744 530 762 515 768C500 762 497 744 515 724Z"
        fill="#77B9E7"
        fillOpacity=".88"
      />
    </g>
  )
}

function ExpressionTired() {
  return (
    <g id="expression-tired">
      <g id="eyes-tired">
        <path
          d="M320 696C338 707 362 707 380 696"
          stroke="#342015"
          strokeWidth="17"
          strokeLinecap="round"
        />
        <path
          d="M448 696C466 707 490 707 508 696"
          stroke="#342015"
          strokeWidth="17"
          strokeLinecap="round"
        />
        <path
          d="M318 673L380 668"
          stroke="#4A2D1D"
          strokeWidth="10"
          strokeLinecap="round"
          opacity=".7"
        />
        <path
          d="M448 668L510 673"
          stroke="#4A2D1D"
          strokeWidth="10"
          strokeLinecap="round"
          opacity=".7"
        />
      </g>
      <path
        id="mouth-tired"
        d="M389 775C402 766 425 786 440 775"
        stroke="#2E190F"
        strokeWidth="14"
        strokeLinecap="round"
      />
    </g>
  )
}

const EXPRESSIONS: Record<BeeExpression, () => React.ReactElement> = {
  cheer: ExpressionCheer,
  proud: ExpressionProud,
  sad: ExpressionSad,
  tired: ExpressionTired,
}

export function BeeMascot({ expression, size = 96, className = '' }: BeeMascotProps) {
  const Expression = EXPRESSIONS[expression]

  return (
    <svg
      viewBox="0 0 1200 1200"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="꿀벌 마스코트"
    >
      <defs>
        <linearGradient
          id="wing-left-fill"
          x1="383"
          y1="278"
          x2="568"
          y2="548"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" />
          <stop offset=".42" stopColor="#F4FAFE" />
          <stop offset="1" stopColor="#D7E7F1" />
        </linearGradient>
        <linearGradient
          id="wing-right-fill"
          x1="953"
          y1="306"
          x2="721"
          y2="552"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" />
          <stop offset=".48" stopColor="#F5FAFE" />
          <stop offset="1" stopColor="#D7E7F0" />
        </linearGradient>
        <radialGradient
          id="body-yellow"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(420 555) rotate(62) scale(410 690)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFE77B" />
          <stop offset=".42" stopColor="#FFD454" />
          <stop offset="1" stopColor="#EEAC32" />
        </radialGradient>
        <linearGradient
          id="body-gloss"
          x1="510"
          y1="505"
          x2="520"
          y2="780"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF5B5" stopOpacity=".56" />
          <stop offset=".5" stopColor="#FFE46C" stopOpacity=".08" />
          <stop offset="1" stopColor="#C9801B" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="brown-fill"
          x1="620"
          y1="505"
          x2="682"
          y2="895"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#64442F" />
          <stop offset=".48" stopColor="#4E3021" />
          <stop offset="1" stopColor="#372016" />
        </linearGradient>
        <radialGradient
          id="face-brown"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(339 685) rotate(56) scale(82)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6B4930" />
          <stop offset=".55" stopColor="#4A2D1D" />
          <stop offset="1" stopColor="#2E190F" />
        </radialGradient>
        <radialGradient
          id="tail-brown"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(972 681) rotate(63) scale(72 58)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#805A3D" />
          <stop offset=".5" stopColor="#563522" />
          <stop offset="1" stopColor="#352015" />
        </radialGradient>
        <linearGradient
          id="coral-bow"
          x1="465"
          y1="454"
          x2="526"
          y2="507"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFB28C" />
          <stop offset="1" stopColor="#E97862" />
        </linearGradient>
        <clipPath id="body-clip">
          <path d="M455 500C334 500 245 584 245 700C245 819 338 886 468 886C583 886 690 890 793 879C909 867 977 802 977 704C977 605 917 541 804 521C690 501 572 500 455 500Z" />
        </clipPath>
        <filter
          id="blur-24"
          x="-30%"
          y="-80%"
          width="160%"
          height="260%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="24" />
        </filter>
        <filter
          id="blur-12"
          x="-30%"
          y="-40%"
          width="160%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <g id="ground-shadow">
        <ellipse
          cx="612"
          cy="895"
          rx="365"
          ry="49"
          fill="#245C9E"
          fillOpacity=".27"
          filter="url(#blur-24)"
        />
      </g>

      <g id="wing-left" className="bee-wing-left">
        <path
          d="M570 545C523 551 438 514 379 449C324 389 316 319 363 282C411 244 479 271 526 328C574 386 607 495 570 545Z"
          fill="#346DA8"
          fillOpacity=".18"
          filter="url(#blur-12)"
          transform="translate(6 12)"
        />
        <path
          d="M570 537C523 543 438 506 379 441C324 381 316 311 363 274C411 236 479 263 526 320C574 378 607 487 570 537Z"
          fill="url(#wing-left-fill)"
        />
        <path
          d="M383 294C423 266 473 282 510 325C552 375 582 451 576 498C555 428 519 359 471 319C439 292 409 286 383 294Z"
          fill="#FFFFFF"
          fillOpacity=".58"
        />
      </g>
      <g id="wing-right" className="bee-wing-right">
        <path
          d="M711 553C701 508 742 413 828 345C907 282 984 286 1011 340C1039 397 990 467 911 510C832 554 728 588 711 553Z"
          fill="#346DA8"
          fillOpacity=".18"
          filter="url(#blur-12)"
          transform="translate(5 12)"
        />
        <path
          d="M711 545C701 500 742 405 828 337C907 274 984 278 1011 332C1039 389 990 459 911 502C832 546 728 580 711 545Z"
          fill="url(#wing-right-fill)"
        />
        <path
          d="M982 326C1001 371 963 423 901 464C835 507 767 531 728 539C757 483 800 422 856 376C908 334 950 319 982 326Z"
          fill="#FFFFFF"
          fillOpacity=".48"
        />
      </g>

      <g id="tail">
        <ellipse
          cx="973"
          cy="706"
          rx="37"
          ry="48"
          fill="#2E5A8B"
          fillOpacity=".22"
          filter="url(#blur-12)"
          transform="translate(6 9)"
        />
        <ellipse cx="973" cy="697" rx="37" ry="48" fill="url(#tail-brown)" />
        <ellipse cx="962" cy="681" rx="12" ry="19" fill="#A47A59" fillOpacity=".33" />
      </g>

      <g id="body-base">
        <path
          d="M455 500C334 500 245 584 245 700C245 819 338 886 468 886C583 886 690 890 793 879C909 867 977 802 977 704C977 605 917 541 804 521C690 501 572 500 455 500Z"
          fill="#7A5B2A"
          fillOpacity=".16"
          filter="url(#blur-12)"
          transform="translate(5 11)"
        />
        <path
          d="M455 500C334 500 245 584 245 700C245 819 338 886 468 886C583 886 690 890 793 879C909 867 977 802 977 704C977 605 917 541 804 521C690 501 572 500 455 500Z"
          fill="url(#body-yellow)"
        />
        <path
          d="M275 654C298 563 371 516 467 511C534 508 592 520 636 543C535 535 417 545 338 603C307 626 287 648 275 654Z"
          fill="url(#body-gloss)"
          clipPath="url(#body-clip)"
        />
      </g>

      <g id="stripe-center" clipPath="url(#body-clip)">
        <path
          d="M548 489C609 500 645 552 664 643C686 747 673 825 631 890C673 890 713 888 751 885C787 811 796 735 776 646C756 556 715 510 657 493Z"
          fill="url(#brown-fill)"
        />
        <path
          d="M568 501C613 519 640 567 657 646C674 725 670 793 651 843C675 792 680 726 665 645C649 566 617 518 568 501Z"
          fill="#8E6B50"
          fillOpacity=".18"
        />
      </g>
      <g id="stripe-rear" clipPath="url(#body-clip)">
        <path
          d="M790 517C827 528 849 568 862 641C879 739 864 817 835 872C866 866 894 856 918 842C943 780 950 713 938 651C923 575 891 535 842 524Z"
          fill="url(#brown-fill)"
        />
        <path
          d="M806 523C834 541 851 581 860 643C872 720 865 784 849 831C869 786 878 724 867 641C858 579 838 540 806 523Z"
          fill="#8E6B50"
          fillOpacity=".16"
        />
      </g>

      <g id="antenna-left">
        <path
          d="M364 534C364 512 358 491 340 472"
          stroke="#3A2115"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M363 529C362 509 356 492 342 476"
          stroke="#755238"
          strokeWidth="7"
          strokeLinecap="round"
          opacity=".45"
        />
        <circle cx="330" cy="465" r="24" fill="url(#face-brown)" />
        <circle cx="323" cy="458" r="7" fill="#B58A66" fillOpacity=".38" />
      </g>
      <g id="antenna-right">
        <path
          d="M475 533C476 508 472 486 457 466"
          stroke="#3A2115"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M474 527C474 507 470 489 459 471"
          stroke="#755238"
          strokeWidth="7"
          strokeLinecap="round"
          opacity=".45"
        />
        <circle cx="450" cy="458" r="24" fill="url(#face-brown)" />
        <circle cx="443" cy="451" r="7" fill="#B58A66" fillOpacity=".38" />
      </g>

      <Expression />

      <g id="gender-female">
        <g id="lashes">
          <path
            d="M320 674L304 662M322 683L301 679"
            stroke="#3A2115"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M508 674L524 662M506 683L527 679"
            stroke="#3A2115"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>
        <g id="ribbon">
          <path
            d="M468 492C481 471 497 469 507 489C495 506 480 507 468 492Z"
            fill="url(#coral-bow)"
          />
          <path
            d="M526 492C513 471 497 469 487 489C499 506 514 507 526 492Z"
            fill="url(#coral-bow)"
          />
          <circle cx="497" cy="490" r="10" fill="#E57461" />
          <circle cx="493" cy="486" r="3" fill="#FFD0BB" fillOpacity=".7" />
        </g>
      </g>
    </svg>
  )
}
