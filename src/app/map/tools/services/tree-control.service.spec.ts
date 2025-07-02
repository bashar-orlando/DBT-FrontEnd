import { TestBed } from '@angular/core/testing';

import { TreeControlService } from './tree-control.service';

describe('TreeControlService', () => {
  let service: TreeControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
