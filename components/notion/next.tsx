import * as React from 'react';

import isEqual from 'react-fast-compare';

export const wrapNextImage = (NextImage: any): React.FC<any> => {
  return React.memo(function ReactNotionXNextImage({
    src,
    alt,
    width,
    height,
    className,
    fill,
    ...rest
  }) {
    if (fill === undefined) {
      fill = !(width && height);
    }

    return (
      <NextImage
        className={className}
        src={src}
        alt={alt}
        width={!fill && width && height ? width : undefined}
        height={!fill && width && height ? height : undefined}
        fill={fill}
        {...rest}
      />
    );
  }, isEqual);
};

export const wrapNextLink = (NextLink: any): React.FC<any> =>
  function ReactNotionXNextLink({
    href,
    as,
    passHref,
    prefetch,
    replace,
    scroll,
    shallow,
    locale,
    ...linkProps
  }) {
    return (
      <NextLink
        href={href}
        passHref={passHref}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        locale={locale}
        {...linkProps}
      />
    );
  };
