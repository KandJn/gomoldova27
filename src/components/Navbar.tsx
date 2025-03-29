import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Navbar as FlowbiteNavbar } from 'flowbite-react';
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
  const { t } = useTranslation();

  return (
    <FlowbiteNavbar fluid className="shadow-sm">
      <FlowbiteNavbar.Brand as={Link} to="/">
        <span className="self-center whitespace-nowrap text-xl font-semibold">
          GoMoldova
        </span>
      </FlowbiteNavbar.Brand>
      
      <FlowbiteNavbar.Toggle />
      
      <FlowbiteNavbar.Collapse>
        <FlowbiteNavbar.Link as={Link} to="/search">
          {t('nav.search')}
        </FlowbiteNavbar.Link>
        
        <FlowbiteNavbar.Link as={Link} to="/offer-seats">
          {t('nav.offer_ride')}
        </FlowbiteNavbar.Link>
        
        <FlowbiteNavbar.Link as={Link} to="/bus-company-registration">
          {t('nav.register_company')}
        </FlowbiteNavbar.Link>
      </FlowbiteNavbar.Collapse>
      
      <div className="flex gap-2">
        <Button as={Link} to="/bus-company-registration" color="primary">
          {t('Register Your Bus Company')}
        </Button>
      </div>
    </FlowbiteNavbar>
  );
}; 